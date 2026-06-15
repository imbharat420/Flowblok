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
