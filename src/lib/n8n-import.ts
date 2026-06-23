// Convert an n8n workflow export (object or fetched JSON) into a Flowblok flow.
//
// n8n stores nodes as `{ name, type, position:[x,y], parameters }` and stores
// connections keyed by the SOURCE node *name* → output type ("main" or an
// "ai_*" sub-node port) → output index → list of `{ node, type, index }`.
// Flowblok stores a flat `connections[]` of `{ from, to, fromPort?, toPort? }`
// referencing node ids, plus nodes as `{ id, type, name, x, y, config }`.
//
// The mapping is best-effort: node types we recognise map to their Flowblok
// equivalent; anything unknown becomes a "No Operation" node (and is reported in
// `unmapped`) so the import always yields a valid, runnable-shaped graph the
// user can finish wiring by hand. The raw n8n parameters are preserved on
// `config._n8n` so nothing is silently lost.

import type { WorkflowConnection, WorkflowNode } from "./types";

export interface N8nConvertResult {
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  /** n8n node types that had no Flowblok equivalent (mapped to no_op). */
  unmapped: string[];
}

// n8n node type (the part after the last ".", lower-cased) → Flowblok type.
const TYPE_MAP: Record<string, string> = {
  // ── triggers ──
  manualtrigger: "manual_trigger",
  scheduletrigger: "schedule",
  cron: "schedule",
  interval: "schedule",
  webhook: "webhook",
  formtrigger: "form_submit",
  form: "form_submit",
  executeworkflowtrigger: "workflow_trigger",
  chattrigger: "chat_trigger",
  emailreadimap: "app_event_trigger",
  errortrigger: "manual_trigger",
  // ── core / flow ──
  httprequest: "http",
  graphql: "http",
  if: "if",
  filter: "filter",
  switch: "switch",
  merge: "merge",
  splitinbatches: "loop",
  code: "code",
  function: "code",
  functionitem: "code",
  executecommand: "code",
  set: "set",
  editfields: "set",
  noop: "no_op",
  wait: "wait",
  stopanderror: "stop_error",
  respondtowebhook: "respond_webhook",
  executeworkflow: "execute_subworkflow",
  // ── data transformation ──
  datetime: "datetime",
  itemlists: "split_out",
  splitout: "split_out",
  aggregate: "aggregate",
  removeduplicates: "remove_duplicates",
  limit: "limit",
  summarize: "summarize",
  sort: "sort",
  renamekeys: "set",
  // ── messaging / email ──
  emailsend: "send_email",
  sendemail: "send_email",
  gmail: "gmail",
  sendgrid: "sendgrid",
  mailchimp: "mailchimp",
  twilio: "send_sms",
  slack: "slack",
  telegram: "telegram",
  discord: "discord",
  microsoftteams: "microsoft_teams",
  // ── apps / integrations ──
  googlesheets: "google_sheets",
  googlecalendar: "google_calendar",
  googledrive: "google_drive",
  notion: "notion",
  airtable: "airtable",
  hubspot: "hubspot",
  salesforce: "salesforce",
  trello: "trello",
  jira: "jira",
  asana: "asana",
  github: "github",
  gitlab: "gitlab",
  shopify: "shopify",
  dropbox: "dropbox",
  zendesk: "zendesk",
  stripe: "stripe",
  // ── databases → Database node ──
  postgres: "db_write",
  mysql: "db_write",
  mongodb: "db_write",
  redis: "db_write",
  supabase: "db_write",
  microsoftsql: "db_write",
  // ── AI / LangChain main nodes ──
  agent: "ai_agent",
  openai: "openai_node",
  chainllm: "basic_llm_chain",
  basicllmchain: "basic_llm_chain",
  chainsummarization: "summarization_chain",
  informationextractor: "information_extractor",
  sentimentanalysis: "sentiment_analysis",
  textclassifier: "text_classifier",
  chainretrievalqa: "qa_chain",
  questionansweringchain: "qa_chain",
  // ── AI chat models (sub-nodes, ai_model) ──
  lmchatopenai: "chat_openai",
  lmopenai: "chat_openai",
  lmchatanthropic: "chat_anthropic",
  lmchatgooglegemini: "chat_google_gemini",
  lmchatgooglevertex: "chat_google_vertex",
  lmchatawsbedrock: "chat_bedrock",
  lmchatazureopenai: "chat_azure_openai",
  lmchatmistralcloud: "chat_mistral",
  lmchatgroq: "chat_groq",
  lmchatollama: "chat_ollama",
  lmchatcohere: "chat_cohere",
  lmchatdeepseek: "chat_deepseek",
  lmchatxaigrok: "chat_xai",
  lmchatopenrouter: "chat_openrouter",
  // ── AI memory (sub-nodes, ai_memory) ──
  memorybufferwindow: "memory_simple",
  memorypostgreschat: "memory_postgres",
  memoryredischat: "memory_redis",
  memorymongodbchat: "memory_mongodb",
  memoryxata: "memory_xata",
  // ── AI tools (sub-nodes, ai_tool) ──
  toolhttprequest: "tool_http",
  toolcalculator: "tool_calculator",
  toolcode: "tool_code",
  toolworkflow: "tool_workflow",
  toolvectorstore: "tool_vector_store",
  toolthink: "tool_think",
  toolwikipedia: "tool_wikipedia",
  mcpclienttool: "tool_mcp",
};

// n8n connection "type" (output kind) → Flowblok sub-port. Anything not here is
// a normal "main" data edge.
const SUB_PORT_BY_CONN: Record<string, "ai_model" | "ai_memory" | "ai_tool"> = {
  ai_languagemodel: "ai_model",
  ai_memory: "ai_memory",
  ai_tool: "ai_tool",
};

function shortType(t: unknown): string {
  return String(t ?? "")
    .split(".")
    .pop()!
    .toLowerCase();
}

function str(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  // n8n often stores resource-locator values as { value, mode } objects.
  if (typeof v === "object" && "value" in (v as object)) return str((v as { value: unknown }).value);
  return undefined;
}

// Pull the handful of parameters we can map cleanly onto Flowblok node configs.
function mapParams(flowType: string, p: Record<string, unknown>): Record<string, unknown> {
  const cfg: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => {
    if (v !== undefined && v !== "") cfg[k] = v;
  };
  switch (flowType) {
    case "http":
      set("url", str(p.url));
      set("method", str(p.method));
      set("body", str(p.jsonBody) ?? str(p.body));
      break;
    case "code":
      set("code", str(p.jsCode) ?? str(p.functionCode) ?? str(p.code));
      break;
    case "ai_agent":
      set("prompt", str(p.text) ?? str(p.prompt));
      set("system", str((p.options as Record<string, unknown>)?.systemMessage) ?? str(p.systemMessage));
      break;
    case "schedule":
      set("cron", str(p.cronExpression));
      break;
    case "webhook":
      set("path", str(p.path));
      set("method", str(p.httpMethod) ?? str(p.method));
      break;
    case "if":
    case "filter": {
      // n8n v2 conditions: { conditions: { conditions: [{ leftValue, operator:{operation}, rightValue }] } }
      const c = ((p.conditions as Record<string, unknown>)?.conditions as Array<Record<string, unknown>>)?.[0];
      if (c) {
        set("left", str(c.leftValue));
        set("right", str(c.rightValue));
      }
      break;
    }
  }
  if (flowType.startsWith("chat_")) {
    set("model", str(p.model));
    set("temperature", (p.options as Record<string, unknown>)?.temperature);
  }
  // Preserve everything else so no detail is lost on import.
  if (Object.keys(p).length) cfg._n8n = p;
  return cfg;
}

function mainPort(srcFlowType: string | undefined, index: number): string {
  if (srcFlowType === "if" || srcFlowType === "filter") return index === 1 ? "false" : "true";
  if (srcFlowType === "switch") return String(Math.min(3, Math.max(0, index)));
  return "main";
}

/**
 * Convert a parsed n8n workflow JSON into Flowblok nodes/connections.
 * @param raw    The parsed n8n export (object).
 * @param valid  Optional set of known Flowblok node types; unknown mappings
 *               fall back to "no_op" and are reported in `unmapped`.
 * @returns the converted flow, or null if `raw` isn't an n8n workflow shape.
 */
export function convertN8nWorkflow(raw: unknown, valid?: Set<string>): N8nConvertResult | null {
  const wf = raw as { name?: unknown; nodes?: unknown; connections?: unknown } | null;
  if (!wf || !Array.isArray(wf.nodes)) return null;

  const unmapped = new Set<string>();
  const nameToId = new Map<string, string>();
  const flowTypeById = new Map<string, string>();

  // Normalise positions: shift the whole graph so the top-left node sits at
  // a small positive margin (n8n positions can be negative or far off-origin).
  const positions = wf.nodes.map((n) => (Array.isArray((n as { position?: unknown }).position) ? (n as { position: number[] }).position : [0, 0]));
  const minX = Math.min(0, ...positions.map((pp) => pp[0] ?? 0));
  const minY = Math.min(0, ...positions.map((pp) => pp[1] ?? 0));

  const nodes: WorkflowNode[] = wf.nodes.map((raw, i) => {
    const n = raw as { name?: unknown; type?: unknown; position?: unknown; parameters?: unknown };
    const id = `n8n_${i}`;
    const name = typeof n.name === "string" && n.name ? n.name : `Node ${i + 1}`;
    const short = shortType(n.type);
    let flowType = TYPE_MAP[short] ?? "no_op";
    if (valid && !valid.has(flowType)) flowType = "no_op";
    if (flowType === "no_op" && short !== "noop") unmapped.add(String(n.type ?? short));
    nameToId.set(name, id);
    flowTypeById.set(id, flowType);
    const pos = Array.isArray(n.position) ? (n.position as number[]) : [0, 0];
    const params = (n.parameters && typeof n.parameters === "object" ? n.parameters : {}) as Record<string, unknown>;
    return {
      id,
      type: flowType,
      name,
      x: Math.round((pos[0] ?? 0) - minX + 80),
      y: Math.round((pos[1] ?? 0) - minY + 80),
      config: mapParams(flowType, params),
    };
  });

  // Connections: n8n keys by source node *name*.
  const connections: WorkflowConnection[] = [];
  const conns = (wf.connections && typeof wf.connections === "object" ? wf.connections : {}) as Record<
    string,
    Record<string, Array<Array<{ node?: string; index?: number }>>>
  >;
  let ci = 0;
  for (const [srcName, byType] of Object.entries(conns)) {
    const fromId = nameToId.get(srcName);
    if (!fromId || !byType || typeof byType !== "object") continue;
    for (const [connType, outputs] of Object.entries(byType)) {
      if (!Array.isArray(outputs)) continue;
      const subPort = SUB_PORT_BY_CONN[connType.toLowerCase()];
      outputs.forEach((targets, outIndex) => {
        if (!Array.isArray(targets)) return;
        for (const t of targets) {
          const toId = t && t.node ? nameToId.get(t.node) : undefined;
          if (!toId) continue;
          if (subPort) {
            // n8n wires sub-node OUTPUT → agent INPUT; in our model the edge is
            // sub-node (from) → agent (to) carrying the sub-port.
            connections.push({ id: `c8n_${ci++}`, from: fromId, to: toId, toPort: subPort });
          } else {
            const port = mainPort(flowTypeById.get(fromId), outIndex);
            connections.push({ id: `c8n_${ci++}`, from: fromId, to: toId, ...(port !== "main" ? { fromPort: port } : {}) });
          }
        }
      });
    }
  }

  return {
    name: typeof wf.name === "string" && wf.name.trim() ? wf.name : "Imported from n8n",
    nodes,
    connections,
    unmapped: [...unmapped],
  };
}
