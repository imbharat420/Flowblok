// AI Agent node handler with sub-nodes (Chat Model / Memory / Tool).
//
// The agent reads its model from an attached Chat Model sub-node (falling back
// to its own `model` param), exposes attached Tool sub-nodes to the model, and
// runs a tool-use loop against the Anthropic Messages API. The API key is read
// from process.env.ANTHROPIC_API_KEY; with no key the node returns a simulated
// reply (still reporting the wired model/memory/tools) so the workflow runs.

import type { ExecItem, WorkflowNode } from "@/lib/types";
import { registerHandler, type NodeHandler, type SubNodes } from "./handlers";
import { assertSafeUrl } from "./net";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-opus-4-8";
const MAX_TOOL_ROUNDS = 8;
const MAX_TOKENS = 4096;
const MAX_ITEMS = 50; // cap LLM fan-out per run

interface AnthropicBlock {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}
interface AnthropicResponse {
  content?: AnthropicBlock[];
  stop_reason?: string;
}

interface AgentTool {
  def: { name: string; description: string; input_schema: Record<string, unknown> };
  exec: (input: Record<string, unknown>) => Promise<unknown>;
}

async function callAnthropic(
  key: string,
  model: string,
  system: string | undefined,
  messages: unknown[],
  tools: AgentTool["def"][],
): Promise<AnthropicResponse> {
  const body: Record<string, unknown> = { model, max_tokens: MAX_TOKENS, messages };
  if (system) body.system = system;
  if (tools.length) body.tools = tools;

  const res = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${text.slice(0, 500)}`);
  try {
    return JSON.parse(text) as AnthropicResponse;
  } catch {
    throw new Error(`Anthropic API returned non-JSON: ${text.slice(0, 300)}`);
  }
}

// ── tool sub-nodes → callable tools ──────────────────────────────────────────

function sanitizeName(raw: unknown, fallback: string): string {
  const s = String(raw ?? "").trim() || fallback;
  return s.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || fallback;
}

function buildTool(node: WorkflowNode): AgentTool {
  const cfg = node.config ?? {};
  if (node.type === "tool_calculator") {
    return {
      def: {
        name: sanitizeName(cfg.name, "calculator"),
        description: "Evaluate a math expression and return the number.",
        input_schema: {
          type: "object",
          properties: { expression: { type: "string", description: "Math expression, e.g. (2+3)*4" } },
          required: ["expression"],
        },
      },
      exec: async (input) => {
        const expr = String(input.expression ?? "");
        if (!/^[-+*/%.()\d\s,]+$/.test(expr)) throw new Error("invalid expression");
        // eslint-disable-next-line no-new-func
        return Function(`"use strict"; return (${expr});`)();
      },
    };
  }
  if (node.type === "tool_http") {
    const url = String(cfg.url ?? "");
    const method = String(cfg.method ?? "GET").toUpperCase();
    return {
      def: {
        name: sanitizeName(cfg.name, "http_request"),
        description: String(cfg.description || "Call an HTTP endpoint and return the response."),
        input_schema: {
          type: "object",
          properties: { input: { type: "string", description: "Value to substitute for {{input}} in the URL" } },
          required: [],
        },
      },
      exec: async (input) => {
        const arg = String(input.input ?? "");
        const finalUrl = url.includes("{{input}}") ? url.replace(/\{\{input\}\}/g, encodeURIComponent(arg)) : url;
        assertSafeUrl(finalUrl); // block SSRF — the model influences this URL
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10_000);
        try {
          const r = await fetch(finalUrl, { method, signal: controller.signal });
          return (await r.text()).slice(0, 2000);
        } finally {
          clearTimeout(timer);
        }
      },
    };
  }
  // tool_code
  return {
    def: {
      name: sanitizeName(cfg.name, "run_code"),
      description: String(cfg.description || "Run a JavaScript function on the input."),
      input_schema: {
        type: "object",
        properties: { input: { type: "string", description: "Input value passed to the function" } },
        required: [],
      },
    },
    exec: async (input) => {
      const code = String(cfg.code ?? "return input;");
      const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as FunctionConstructor;
      const fn = new AsyncFunction("input", `"use strict";\n${code}`);
      return await fn(input.input);
    },
  };
}

// Build tools with de-duplicated names (Anthropic rejects duplicate tool names).
function buildTools(nodes: WorkflowNode[]): AgentTool[] {
  const tools = nodes.map(buildTool);
  const seen = new Set<string>();
  for (const t of tools) {
    let name = t.def.name;
    if (seen.has(name)) {
      let i = 2;
      while (seen.has(`${name}_${i}`.slice(0, 64))) i++;
      name = `${name}_${i}`.slice(0, 64);
      t.def.name = name;
    }
    seen.add(name);
  }
  return tools;
}

function modelFor(subNodes: SubNodes, getParam: (k: string, i?: ExecItem) => unknown, item: ExecItem): string {
  const m = subNodes.model?.config?.model;
  if (typeof m === "string" && m) return m;
  return String(getParam("model", item) ?? DEFAULT_MODEL);
}

const aiAgent: NodeHandler = async ({ items, getParam, log, subNodes }) => {
  const key = process.env.ANTHROPIC_API_KEY;
  const all = items.length ? items : [{ json: {} }];
  const src = all.slice(0, MAX_ITEMS);
  if (all.length > MAX_ITEMS) log(`capped to ${MAX_ITEMS} of ${all.length} items`);

  const tools = buildTools(subNodes.tools);
  const toolByName = new Map(tools.map((t) => [t.def.name, t]));
  const toolNames = tools.map((t) => t.def.name);
  const memWindow = subNodes.memory ? Number(subNodes.memory.config?.windowSize ?? 10) : 0;

  if (subNodes.model) log(`model: ${subNodes.model.config?.model ?? "?"} (${subNodes.model.config?.provider ?? "Anthropic"})`);
  if (toolNames.length) log(`tools: ${toolNames.join(", ")}`);
  if (subNodes.memory) log(`memory attached (window ${memWindow}) — not yet applied`);

  if (!key) {
    log("no ANTHROPIC_API_KEY set — returning simulated reply");
    return {
      items: src.map((item) => {
        const prompt = String(getParam("prompt", item) ?? "");
        return {
          json: {
            ...item.json,
            ai: {
              model: modelFor(subNodes, getParam, item),
              tools: toolNames,
              memory: subNodes.memory ? memWindow : null,
              text: `(simulated) Would answer "${prompt.slice(0, 80)}"` + (toolNames.length ? ` using tools: ${toolNames.join(", ")}` : ""),
              simulated: true,
            },
          },
        };
      }),
    };
  }

  const out: ExecItem[] = [];
  for (const item of src) {
    const prompt = String(getParam("prompt", item) ?? "");
    const model = modelFor(subNodes, getParam, item);
    const systemRaw = getParam("system", item);
    const system = systemRaw === undefined || systemRaw === "" ? undefined : String(systemRaw);

    log(`${model} · ${prompt.slice(0, 60)}`);
    const messages: unknown[] = [{ role: "user", content: prompt }];
    let finalText = "";
    let converged = false;
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const resp = await callAnthropic(key, model, system, messages, tools.map((t) => t.def));
      if (resp.stop_reason === "max_tokens") log("response truncated at max_tokens");
      const content = resp.content ?? [];
      const toolUses = content.filter((c) => c.type === "tool_use");
      if (resp.stop_reason !== "tool_use" || toolUses.length === 0) {
        finalText = content.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n");
        converged = true;
        break;
      }
      messages.push({ role: "assistant", content });
      const results = [];
      for (const tu of toolUses) {
        const tool = toolByName.get(tu.name ?? "");
        let resultContent: string;
        let isError = false;
        try {
          if (!tool) {
            resultContent = `tool ${tu.name} not found`;
            isError = true;
          } else {
            const r = await tool.exec(tu.input ?? {});
            resultContent = typeof r === "string" ? r : JSON.stringify(r);
          }
        } catch (err) {
          resultContent = (err as Error).message;
          isError = true;
        }
        log(`tool ${tu.name} → ${(isError ? "error: " : "") + resultContent.slice(0, 80)}`);
        results.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: resultContent,
          ...(isError ? { is_error: true } : {}),
        });
      }
      messages.push({ role: "user", content: results });
    }
    if (!converged) {
      log(`tool loop hit ${MAX_TOOL_ROUNDS} rounds without finishing`);
      finalText = finalText || "(agent did not finish: max tool rounds reached)";
    }
    out.push({ json: { ...item.json, ai: { model, tools: toolNames, text: finalText } } });
  }
  return { items: out };
};

registerHandler("ai_agent", aiAgent);
