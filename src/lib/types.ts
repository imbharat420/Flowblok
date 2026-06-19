// Flowblok domain types (first visualization).
// Storyblok-inspired: a Space contains Stories (content entries) built from Components (blocks).

export type ContentStatus = "draft" | "review" | "published";

export interface Story {
  id: string;
  name: string;
  slug: string;
  /** content-type component name, e.g. "page", "post", "product" */
  contentType: string;
  status: ContentStatus;
  folder: string | null;
  author: string;
  updatedAt: string; // ISO
  /** block tree root — Storyblok-style nested content */
  content: BlockNode;
}

export interface BlockNode {
  /** component/block name */
  component: string;
  props: Record<string, unknown>;
  children?: BlockNode[];
}

export interface Folder {
  id: string;
  name: string;
  storyCount: number;
}

// A saved snapshot of a story's content tree (version history).
export interface StoryVersion {
  id: string;
  at: string; // ISO
  author: string;
  label: string;
  content: BlockNode;
}

// Data-source binding persisted on a block (the Data tab).
export interface DataBinding {
  source: "static" | "database" | "api" | "workflow" | "ai" | "crm" | "commerce";
  ref?: string; // table id / workflow id / endpoint id / product id / crm entity
  refLabel?: string;
  prompt?: string; // for AI source
  // ----- method-aware API binding (source === "api") -----
  apiEndpointId?: string;
  apiMethod?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  apiKind?: "read" | "mutation";
  apiTrigger?: string;
  apiParams?: { key: string; value: string }[]; // path/query params for reads
  apiBody?: { key: string; value: string }[]; // request-body map for mutations
  apiResultTarget?: string; // where a mutation result surfaces
}

export interface Space {
  id: string;
  name: string;
  plan: "Starter" | "Professional" | "Business" | "Enterprise";
  counts: SpaceCounts;
}

export interface SpaceCounts {
  pages: number;
  collections: number;
  workflows: number;
  apis: number;
  users: number;
  roles: number;
  aiAgents: number;
  deployments: number;
}

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string; // ISO
  kind: "publish" | "edit" | "create" | "workflow" | "deploy";
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface ListQuery {
  search?: string;
  status?: ContentStatus;
  contentType?: string;
  page?: number;
  perPage?: number;
}

// ----- Component (block) registry -----
// Drives the block library and the Design tab of the page builder.

export type FieldType = "text" | "textarea" | "number" | "color" | "select" | "boolean";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  default?: unknown;
}

export interface ComponentDef {
  name: string; // matches BlockNode.component
  label: string;
  icon: string; // lucide icon name
  category: "layout" | "content" | "media" | "action" | "commerce";
  fields: FieldDef[];
  allowChildren?: boolean;
}

export interface UpdateStoryInput {
  name?: string;
  status?: ContentStatus;
  content?: BlockNode;
}

// ----- Workflow engine (n8n / Boomi inspired) -----

export type NodeKind = "trigger" | "logic" | "action" | "integration";

// A configurable field on a node type — rendered as a form control in the
// builder's inspector and stored on WorkflowNode.config[key].
export type NodeParamType = "text" | "textarea" | "number" | "boolean" | "select";

export interface NodeParam {
  key: string;
  label: string;
  type: NodeParamType;
  placeholder?: string;
  options?: string[]; // for type: "select"
  default?: string | number | boolean;
  hint?: string;
}

export interface NodeType {
  type: string; // e.g. "webhook", "if", "send_email"
  label: string;
  icon: string; // lucide icon name
  kind: NodeKind;
  category: string; // palette group
  description: string;
  params?: NodeParam[];
  // Sub-node attach point. If set, this node is a SUB-NODE that plugs into a
  // parent (e.g. AI Agent) via that port rather than running in the main flow.
  subPort?: "ai_model" | "ai_memory" | "ai_tool";
}

export interface WorkflowNode {
  id: string;
  type: string; // references NodeType.type
  name: string;
  x: number;
  y: number;
  config?: Record<string, unknown>;
}

export interface WorkflowConnection {
  id: string;
  from: string; // node id
  to: string; // node id
  fromPort?: string; // output port on the source node (e.g. "true"/"false" for If); default "main"
  toPort?: string; // input port on the target — "ai_model"/"ai_memory"/"ai_tool" attaches a sub-node
}

// ----- Execution model (n8n-style: items flow between nodes) -----

export interface ExecItem {
  json: Record<string, unknown>;
}

export type RunTrigger = "manual" | "webhook" | "schedule" | "form";
export type RunStatus = "success" | "error" | "running";
export type NodeRunStatus = "success" | "error" | "skipped";

export interface NodeRunLog {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: NodeRunStatus;
  startedAt: string;
  finishedAt: string;
  itemsIn: number;
  itemsOut: number;
  inputSample: ExecItem[]; // capped sample of input items (for the node detail view)
  output: ExecItem[]; // capped sample of output items
  messages: string[]; // handler log lines
  error?: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: RunStatus;
  trigger: RunTrigger;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number;
  nodeLogs: NodeRunLog[];
  error?: string;
}

// ----- Identity, roles & access (super-admin management) -----

export type Role = "owner" | "admin" | "manager" | "developer" | "editor" | "viewer";

export type Capability =
  | "view_dashboard"
  | "manage_spaces"
  | "edit_content"
  | "edit_components"
  | "edit_data"
  | "manage_workflows"
  | "manage_apis"
  | "manage_crm"
  | "manage_commerce"
  | "use_ai"
  | "view_analytics"
  | "manage_marketplace"
  | "manage_assets"
  | "manage_users"
  | "manage_settings"
  | "manage_billing"
  | "use_developer_mode";

export type UserStatus = "active" | "invited" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarColor: string;
  lastActive: string | null;
}

export type WorkflowStatus = "active" | "inactive" | "draft";

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  lastRun: string | null;
  runs: number;
}

export interface CreateWorkflowInput {
  name: string;
  nodes?: WorkflowNode[];
  connections?: WorkflowConnection[];
}

export interface UpdateWorkflowInput {
  name?: string;
  status?: WorkflowStatus;
  nodes?: WorkflowNode[];
  connections?: WorkflowConnection[];
}
