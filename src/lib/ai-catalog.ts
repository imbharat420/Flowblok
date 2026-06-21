// AI sub-node catalog — the full set of Chat Model / Memory / Tool sub-nodes
// an AI Agent can attach (mirrors n8n's Language Models, Memory, and Tools
// panels). Kept here so both the server (node-type catalog) and the client
// sub-port model (subnodes.ts) stay in sync from one source of truth.
//
// These are catalog/UI entries: configuring them works end-to-end, but the
// execution engine routes every chat model through the existing Anthropic /
// simulated path and only http/calculator/code tools actually run. Other
// providers appear and configure exactly like n8n without a live backend.

import type { NodeParam } from "./types";

export type AiSubPort = "ai_model" | "ai_memory" | "ai_tool";

export interface AiNodeDef {
  type: string;
  label: string;
  icon: string; // lucide icon name
  category: string; // palette group
  subPort: AiSubPort;
  description: string;
  params: NodeParam[];
  // Heading within the agent's sub-port picker (e.g. memory's "For beginners"
  // / "Other memories", tools' "Recommended Tools"). Undefined => no heading.
  subgroup?: string;
}

// ── Chat Models ──────────────────────────────────────────────────────────────

function chatModel(
  type: string,
  label: string,
  icon: string,
  models: string[],
  credentialType: string,
  extra: NodeParam[] = [],
): AiNodeDef {
  return {
    type,
    label,
    icon,
    category: "AI · Chat Models",
    subPort: "ai_model",
    description: `${label} for an AI Agent.`,
    params: [
      models.length
        ? { key: "model", label: "Model", type: "select", options: models, default: models[0] }
        : { key: "model", label: "Model", type: "text", placeholder: "model-name" },
      { key: "temperature", label: "Temperature", type: "number", default: 0.7, hint: "0 = deterministic, 1 = creative." },
      ...extra,
      { key: "credential", label: "Credential", type: "credential", credentialType, hint: "Optional in this demo." },
    ],
  };
}

export const CHAT_MODELS: AiNodeDef[] = [
  chatModel("chat_anthropic", "Anthropic Chat Model", "Sparkles", ["claude-opus-4-8", "claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"], "anthropic"),
  chatModel("chat_openai", "OpenAI Chat Model", "Bot", ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1", "o1-mini", "gpt-3.5-turbo"], "openai"),
  chatModel("chat_azure_openai", "Azure OpenAI Chat Model", "Cloud", ["gpt-4o", "gpt-4-turbo", "gpt-35-turbo"], "azure_openai", [
    { key: "endpoint", label: "Resource endpoint", type: "text", placeholder: "https://my-resource.openai.azure.com" },
    { key: "deployment", label: "Deployment name", type: "text", placeholder: "gpt-4o" },
  ]),
  chatModel("chat_bedrock", "AWS Bedrock Chat Model", "Cloud", ["anthropic.claude-3-5-sonnet", "amazon.titan-text-premier", "meta.llama3-70b"], "aws", [
    { key: "region", label: "Region", type: "text", default: "us-east-1" },
  ]),
  chatModel("chat_google_gemini", "Google Gemini Chat Model", "Sparkles", ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"], "google_gemini"),
  chatModel("chat_google_vertex", "Google Vertex Chat Model", "Cloud", ["gemini-2.0-flash", "gemini-1.5-pro"], "google_vertex", [
    { key: "projectId", label: "Project ID", type: "text", placeholder: "my-gcp-project" },
    { key: "region", label: "Region", type: "text", default: "us-central1" },
  ]),
  chatModel("chat_cohere", "Cohere Chat Model", "Boxes", ["command-r-plus", "command-r", "command"], "cohere"),
  chatModel("chat_deepseek", "DeepSeek Chat Model", "Cpu", ["deepseek-chat", "deepseek-reasoner"], "deepseek"),
  chatModel("chat_mistral", "Mistral Cloud Chat Model", "Cpu", ["mistral-large-latest", "mistral-small-latest", "open-mixtral-8x22b"], "mistral"),
  chatModel("chat_groq", "Groq Chat Model", "Cpu", ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"], "groq"),
  chatModel("chat_xai", "xAI Grok Chat Model", "Bot", ["grok-2", "grok-2-mini", "grok-beta"], "xai"),
  chatModel("chat_openrouter", "OpenRouter Chat Model", "Boxes", [], "openrouter", [
    { key: "model", label: "Model", type: "text", placeholder: "anthropic/claude-3.5-sonnet" },
  ]),
  chatModel("chat_ollama", "Ollama Chat Model", "Server", [], "ollama", [
    { key: "baseUrl", label: "Base URL", type: "text", default: "http://localhost:11434" },
    { key: "model", label: "Model", type: "text", placeholder: "llama3.1" },
  ]),
  chatModel("chat_huggingface", "Hugging Face Inference Model", "Cpu", [], "huggingface", [
    { key: "model", label: "Model", type: "text", placeholder: "meta-llama/Llama-3.1-8B-Instruct" },
  ]),
  chatModel("chat_baseten", "Baseten Chat Model", "Server", [], "baseten", [
    { key: "modelUrl", label: "Model URL", type: "text", placeholder: "https://model-xxx.api.baseten.co" },
  ]),
  chatModel("chat_edenai", "Eden AI Chat Model", "Boxes", [], "edenai", [
    { key: "provider", label: "Provider", type: "text", placeholder: "openai" },
    { key: "model", label: "Model", type: "text", placeholder: "gpt-4o" },
  ]),
  chatModel("chat_alibaba", "Alibaba Cloud Chat Model", "Cloud", ["qwen-max", "qwen-plus", "qwen-turbo"], "alibaba"),
  chatModel("chat_minimax", "MiniMax Chat Model", "Cpu", ["abab6.5s-chat", "abab6.5-chat"], "minimax"),
  chatModel("chat_moonshot", "Moonshot Kimi Chat Model", "Cpu", ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"], "moonshot"),
  chatModel("chat_lemonade", "Lemonade Chat Model", "Cpu", [], "lemonade", [
    { key: "baseUrl", label: "Base URL", type: "text", default: "http://localhost:8000" },
    { key: "model", label: "Model", type: "text", placeholder: "Llama-3.1-8B" },
  ]),
  chatModel("chat_nvidia", "NVIDIA Nemotron Chat Model", "Cpu", ["nemotron-4-340b-instruct", "llama-3.1-nemotron-70b"], "nvidia", [
    { key: "baseUrl", label: "Base URL", type: "text", default: "https://integrate.api.nvidia.com/v1", hint: "build.nvidia.com or a self-hosted NIM." },
  ]),
  chatModel("chat_vercel", "Vercel AI Gateway Chat Model", "Cloud", [], "vercel", [
    { key: "model", label: "Model", type: "text", placeholder: "anthropic/claude-3.5-sonnet" },
  ]),
  chatModel("chat_eurouter", "EUrouter Chat Model", "Cloud", [], "eurouter", [
    { key: "model", label: "Model", type: "text", placeholder: "openai/gpt-4o", hint: "100+ models, served from EU infrastructure." },
  ]),
  {
    type: "chat_model_selector", label: "Model Selector", icon: "Shuffle", category: "AI · Chat Models", subPort: "ai_model",
    description: "Select one of the connected models based on workflow data.",
    params: [
      { key: "rules", label: "Selection rules (JSON)", type: "textarea", placeholder: "[{ \"when\": \"{{ $json.tier }} === 'pro'\", \"model\": 0 }]" },
      { key: "fallback", label: "Fallback model index", type: "number", default: 0 },
    ],
  },
];

// ── Memory ───────────────────────────────────────────────────────────────────

const SESSION_KEY: NodeParam = { key: "sessionKey", label: "Session key", type: "text", default: "={{ $json.sessionId }}", hint: "Key used to group a conversation." };

export const MEMORIES: AiNodeDef[] = [
  {
    type: "memory_simple", label: "Simple Memory", icon: "MessageSquare", category: "AI · Memory", subPort: "ai_memory", subgroup: "For beginners",
    description: "Stores in workflow memory, so no credentials required.",
    params: [SESSION_KEY, { key: "contextWindowLength", label: "Context window length", type: "number", default: 5, hint: "How many recent turns to keep." }],
  },
  {
    type: "memory_mongodb", label: "MongoDB Chat Memory", icon: "Database", category: "AI · Memory", subPort: "ai_memory", subgroup: "Other memories",
    description: "Stores the chat history in MongoDB collection.",
    params: [{ key: "credential", label: "MongoDB credential", type: "credential", credentialType: "mongodb" }, SESSION_KEY, { key: "collection", label: "Collection", type: "text", default: "n8n_chat_histories" }, { key: "contextWindowLength", label: "Context window length", type: "number", default: 5 }],
  },
  {
    type: "memory_postgres", label: "Postgres Chat Memory", icon: "Database", category: "AI · Memory", subPort: "ai_memory", subgroup: "Other memories",
    description: "Stores the chat history in Postgres table.",
    params: [{ key: "credential", label: "Postgres credential", type: "credential", credentialType: "postgres" }, SESSION_KEY, { key: "tableName", label: "Table name", type: "text", default: "n8n_chat_histories" }, { key: "contextWindowLength", label: "Context window length", type: "number", default: 5 }],
  },
  {
    type: "memory_redis", label: "Redis Chat Memory", icon: "Database", category: "AI · Memory", subPort: "ai_memory", subgroup: "Other memories",
    description: "Stores the chat history in Redis.",
    params: [{ key: "credential", label: "Redis credential", type: "credential", credentialType: "redis" }, SESSION_KEY, { key: "ttl", label: "Session TTL (seconds)", type: "number", default: 3600 }, { key: "contextWindowLength", label: "Context window length", type: "number", default: 5 }],
  },
  {
    type: "memory_xata", label: "Xata", icon: "Database", category: "AI · Memory", subPort: "ai_memory", subgroup: "Other memories",
    description: "Use Xata Memory.",
    params: [{ key: "credential", label: "Xata credential", type: "credential", credentialType: "xata" }, SESSION_KEY, { key: "contextWindowLength", label: "Context window length", type: "number", default: 5 }],
  },
];

// ── Tools ────────────────────────────────────────────────────────────────────

export const AI_TOOLS: AiNodeDef[] = [
  {
    type: "tool_http", label: "HTTP Request Tool", icon: "Globe", category: "AI · Tools", subPort: "ai_tool", subgroup: "Recommended Tools",
    description: "Makes an HTTP request and returns the response data.",
    params: [
      { key: "name", label: "Tool name", type: "text", placeholder: "get_data" },
      { key: "description", label: "Description", type: "textarea", placeholder: "What this tool does (the model reads this)" },
      { key: "method", label: "Method", type: "select", options: ["GET", "POST"], default: "GET" },
      { key: "url", label: "URL", type: "text", placeholder: "https://api.example.com/items?q={{input}}" },
    ],
  },
  {
    type: "tool_calculator", label: "Calculator", icon: "Calculator", category: "AI · Tools", subPort: "ai_tool", subgroup: "More tools",
    description: "Lets the agent evaluate math expressions.",
    params: [{ key: "name", label: "Tool name", type: "text", default: "calculator" }],
  },
  {
    type: "tool_code", label: "Code Tool", icon: "Code", category: "AI · Tools", subPort: "ai_tool", subgroup: "Recommended Tools",
    description: "Write a tool in JS or Python.",
    params: [
      { key: "name", label: "Tool name", type: "text", placeholder: "transform" },
      { key: "description", label: "Description", type: "textarea", placeholder: "What this tool does" },
      { key: "code", label: "Code", type: "textarea", placeholder: "return input.toUpperCase();" },
    ],
  },
  {
    type: "tool_workflow", label: "Call n8n Workflow Tool", icon: "Workflow", category: "AI · Tools", subPort: "ai_tool", subgroup: "Recommended Tools",
    description: "Uses another workflow as a tool. Allows packaging any node(s) as a tool.",
    params: [
      { key: "name", label: "Tool name", type: "text", placeholder: "run_subflow" },
      { key: "description", label: "Description", type: "textarea", placeholder: "What this sub-workflow does" },
      { key: "workflowId", label: "Workflow", type: "text", placeholder: "wf_..." },
    ],
  },
  {
    type: "tool_agent", label: "AI Agent Tool", icon: "Bot", category: "AI · Tools", subPort: "ai_tool", subgroup: "Recommended Tools",
    description: "Generates an action plan and executes it. Can use external tools.",
    params: [
      { key: "name", label: "Tool name", type: "text", default: "sub_agent" },
      { key: "description", label: "Description", type: "textarea", placeholder: "When the agent should delegate to this sub-agent" },
      { key: "system", label: "System prompt", type: "textarea", placeholder: "You are a specialised assistant…" },
    ],
  },
  {
    type: "tool_vector_store", label: "Vector Store Tool", icon: "Boxes", category: "AI · Tools", subPort: "ai_tool", subgroup: "More tools",
    description: "Retrieve from a vector store (Supabase, Pinecone, MongoDB…).",
    params: [
      { key: "name", label: "Tool name", type: "text", default: "knowledge_base" },
      { key: "description", label: "Description", type: "textarea", placeholder: "What knowledge this store contains" },
      { key: "store", label: "Store", type: "select", options: ["In-Memory", "Pinecone", "Supabase", "MongoDB Atlas", "Qdrant", "Weaviate"], default: "In-Memory" },
      { key: "topK", label: "Top K results", type: "number", default: 4 },
    ],
  },
  {
    type: "tool_mcp", label: "MCP Client Tool", icon: "Server", category: "AI · Tools", subPort: "ai_tool", subgroup: "More tools",
    description: "Add a toolset from an external MCP server.",
    params: [
      { key: "endpoint", label: "MCP server URL (SSE)", type: "text", placeholder: "https://mcp.example.com/sse" },
      { key: "credential", label: "Credential", type: "credential", credentialType: "http_header" },
    ],
  },
  {
    type: "tool_think", label: "Think Tool", icon: "Brain", category: "AI · Tools", subPort: "ai_tool", subgroup: "More tools",
    description: "Gives the agent space to reason before answering.",
    params: [{ key: "name", label: "Tool name", type: "text", default: "think" }],
  },
  {
    type: "tool_wikipedia", label: "Wikipedia", icon: "BookOpen", category: "AI · Tools", subPort: "ai_tool", subgroup: "More tools",
    description: "Lets the agent search Wikipedia.",
    params: [{ key: "name", label: "Tool name", type: "text", default: "wikipedia" }],
  },
  {
    type: "tool_serpapi", label: "SerpApi (Google Search)", icon: "Search", category: "AI · Tools", subPort: "ai_tool", subgroup: "More tools",
    description: "Lets the agent run a web search via SerpApi.",
    params: [{ key: "name", label: "Tool name", type: "text", default: "google_search" }, { key: "credential", label: "SerpApi credential", type: "credential", credentialType: "serpapi" }],
  },
  {
    type: "tool_wolfram", label: "Wolfram|Alpha", icon: "Sigma", category: "AI · Tools", subPort: "ai_tool", subgroup: "More tools",
    description: "Lets the agent query Wolfram|Alpha for computation.",
    params: [{ key: "name", label: "Tool name", type: "text", default: "wolfram_alpha" }, { key: "credential", label: "Wolfram credential", type: "credential", credentialType: "wolfram" }],
  },
];

export const AI_SUB_NODES: AiNodeDef[] = [...CHAT_MODELS, ...MEMORIES, ...AI_TOOLS];

// type -> sub-port, used to build the shared SUB_NODE_PORT map.
export const AI_SUB_PORT_BY_TYPE: Record<string, AiSubPort> = Object.fromEntries(
  AI_SUB_NODES.map((d) => [d.type, d.subPort]),
);
