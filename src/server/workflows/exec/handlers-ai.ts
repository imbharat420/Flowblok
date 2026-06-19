// AI Agent node handler with sub-nodes (Chat Model / Memory / Tool).
//
// The agent reads its model from an attached Chat Model sub-node (falling back
// to its own `model` param), exposes attached Tool sub-nodes to the model, and
// runs a tool-use loop against the Anthropic Messages API. The API key is read
// from process.env.ANTHROPIC_API_KEY; with no key the node returns a simulated
// reply (still reporting the wired model/memory/tools) so the workflow runs.

import type { ExecItem, WorkflowNode } from "@/lib/types";
import { registerHandler, type NodeHandler, type SubNodes } from "./handlers";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-opus-4-8";
const MAX_TOOL_ROUNDS = 6;

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
  const body: Record<string, unknown> = { model, max_tokens: 1024, messages };
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

function modelFor(subNodes: SubNodes, getParam: (k: string, i?: ExecItem) => unknown, item: ExecItem): string {
  const m = subNodes.model?.config?.model;
  if (typeof m === "string" && m) return m;
  return String(getParam("model", item) ?? DEFAULT_MODEL);
}

const aiAgent: NodeHandler = async ({ items, getParam, log, subNodes }) => {
  const key = process.env.ANTHROPIC_API_KEY;
  const src = items.length ? items : [{ json: {} }];
  const tools = subNodes.tools.map(buildTool);
  const toolNames = tools.map((t) => t.def.name);
  const memWindow = subNodes.memory ? Number(subNodes.memory.config?.windowSize ?? 10) : 0;

  if (subNodes.model) log(`model: ${subNodes.model.config?.model ?? "?"} (${subNodes.model.config?.provider ?? "Anthropic"})`);
  if (toolNames.length) log(`tools: ${toolNames.join(", ")}`);
  if (subNodes.memory) log(`memory window: ${memWindow}`);

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
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const resp = await callAnthropic(key, model, system, messages, tools.map((t) => t.def));
      const content = resp.content ?? [];
      const toolUses = content.filter((c) => c.type === "tool_use");
      if (resp.stop_reason !== "tool_use" || toolUses.length === 0) {
        finalText = content.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n");
        break;
      }
      messages.push({ role: "assistant", content });
      const results = [];
      for (const tu of toolUses) {
        const tool = tools.find((t) => t.def.name === tu.name);
        let result: unknown;
        try {
          result = tool ? await tool.exec(tu.input ?? {}) : `tool ${tu.name} not found`;
        } catch (err) {
          result = `error: ${(err as Error).message}`;
        }
        log(`tool ${tu.name}(${JSON.stringify(tu.input ?? {})}) → ${String(result).slice(0, 80)}`);
        results.push({ type: "tool_result", tool_use_id: tu.id, content: String(result) });
      }
      messages.push({ role: "user", content: results });
    }
    out.push({ json: { ...item.json, ai: { model, tools: toolNames, text: finalText } } });
  }
  return { items: out };
};

registerHandler("ai_agent", aiAgent);
