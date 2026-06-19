// Sub-node model shared by the engine and the builder.
//
// A sub-node attaches to a parent node (currently the AI Agent) through a typed
// port instead of flowing data in the main graph. Connections that carry a
// sub-node use `toPort` = one of these values.

export type SubPort = "ai_model" | "ai_memory" | "ai_tool";

export const SUB_PORTS: SubPort[] = ["ai_model", "ai_memory", "ai_tool"];

export const SUB_PORT_LABEL: Record<SubPort, string> = {
  ai_model: "Chat Model",
  ai_memory: "Memory",
  ai_tool: "Tool",
};

// node type -> the sub-port it plugs into. The source of truth for "is this a
// sub-node?" on both client and server.
export const SUB_NODE_PORT: Record<string, SubPort> = {
  chat_model: "ai_model",
  memory: "ai_memory",
  tool_http: "ai_tool",
  tool_calculator: "ai_tool",
  tool_code: "ai_tool",
};

export function isSubNode(type: string): boolean {
  return type in SUB_NODE_PORT;
}

export function isSubPort(port: string | undefined): port is SubPort {
  return port === "ai_model" || port === "ai_memory" || port === "ai_tool";
}
