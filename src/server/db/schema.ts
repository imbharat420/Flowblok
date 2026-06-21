// Drizzle schema — the single source of truth for the Postgres database.
// Timestamps are stored as timestamptz and read with `mode: "string"`, which
// returns Postgres' native, server-TZ format (e.g. "2026-05-02 10:15:00+00").
// Repository mappers (rowTo*) normalize these to UTC ISO-8601 via
// `new Date(v).toISOString()` so client-facing DTOs keep a strict ISO contract.
// JSON graph/log data is stored as jsonb and typed back to the domain types.

import { pgTable, text, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import type { WorkflowNode, WorkflowConnection, NodeRunLog, BlockNode } from "@/lib/types";

const iso = (col: string) => timestamp(col, { withTimezone: true, mode: "string" });

// ── Identity & sessions ──────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("owner"), // RBAC Role
    verified: boolean("verified").notNull().default(false),
    // profile (mirrors AccountProfile)
    username: text("username"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    avatarColor: text("avatar_color").default("#2563eb"),
    githubConnected: boolean("github_connected").notNull().default(false),
    githubEmail: text("github_email"),
    createdAt: iso("created_at").notNull().defaultNow(),
    updatedAt: iso("updated_at").notNull().defaultNow(),
  },
  (t) => [index("users_email_idx").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: iso("expires_at").notNull(),
    createdAt: iso("created_at").notNull().defaultNow(),
    userAgent: text("user_agent"),
    ip: text("ip"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const emailVerifications = pgTable(
  "email_verifications",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(), // OTP is hashed at rest
    purpose: text("purpose").notNull(), // "register" | "login"
    expiresAt: iso("expires_at").notNull(),
    attempts: integer("attempts").notNull().default(0),
    createdAt: iso("created_at").notNull().defaultNow(),
  },
  (t) => [index("email_verifications_email_idx").on(t.email)],
);

// ── Spaces (a "site" / workspace, owned by an account) ───────────────────────
export const spaces = pgTable(
  "spaces",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    niche: text("niche").notNull().default("general"),
    plan: text("plan").notNull().default("Professional"),
    region: text("region").notNull().default("us-east-1"),
    status: text("status").notNull().default("active"), // active | paused
    members: integer("members").notNull().default(1),
    archivedAt: iso("archived_at"),
    purgeAt: iso("purge_at"),
    createdAt: iso("created_at").notNull().defaultNow(),
    updatedAt: iso("updated_at").notNull().defaultNow(),
  },
  (t) => [index("spaces_owner_idx").on(t.ownerId)],
);

// ── Content / Stories (space-scoped CMS entries; pages are a contentType) ─────
export const stories = pgTable(
  "stories",
  {
    id: text("id").primaryKey(),
    spaceId: text("space_id")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    contentType: text("content_type").notNull(),
    status: text("status").notNull().default("draft"), // draft | review | published
    folder: text("folder"),
    author: text("author").notNull().default("system"),
    content: jsonb("content").$type<BlockNode>().notNull(),
    createdAt: iso("created_at").notNull().defaultNow(),
    updatedAt: iso("updated_at").notNull().defaultNow(),
  },
  (t) => [index("stories_space_idx").on(t.spaceId), index("stories_space_type_idx").on(t.spaceId, t.contentType)],
);

export const storyVersions = pgTable(
  "story_versions",
  {
    id: text("id").primaryKey(),
    storyId: text("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    at: iso("at").notNull().defaultNow(),
    author: text("author").notNull(),
    label: text("label").notNull(),
    content: jsonb("content").$type<BlockNode>().notNull(),
  },
  (t) => [index("story_versions_story_idx").on(t.storyId)],
);

// ── Workflows ────────────────────────────────────────────────────────────────
export const workflows = pgTable(
  "workflows",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    status: text("status").notNull().default("draft"), // active | inactive | draft
    nodes: jsonb("nodes").$type<WorkflowNode[]>().notNull().default([]),
    connections: jsonb("connections").$type<WorkflowConnection[]>().notNull().default([]),
    runs: integer("runs").notNull().default(0),
    lastRun: iso("last_run"),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
    spaceId: text("space_id").references(() => spaces.id, { onDelete: "cascade" }),
    createdAt: iso("created_at").notNull().defaultNow(),
    updatedAt: iso("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("workflows_status_idx").on(t.status),
    index("workflows_created_idx").on(t.createdAt),
    index("workflows_space_idx").on(t.spaceId),
  ],
);

export const workflowRuns = pgTable(
  "workflow_runs",
  {
    id: text("id").primaryKey(),
    workflowId: text("workflow_id")
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    status: text("status").notNull(), // success | error | running
    trigger: text("trigger").notNull(), // manual | webhook | schedule | form
    startedAt: iso("started_at").notNull(),
    finishedAt: iso("finished_at"),
    durationMs: integer("duration_ms").notNull().default(0),
    nodeLogs: jsonb("node_logs").$type<NodeRunLog[]>().notNull().default([]),
    error: text("error"),
  },
  (t) => [index("workflow_runs_wf_idx").on(t.workflowId, t.startedAt)],
);

export const credentials = pgTable(
  "credentials",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    // AES-256-GCM encrypted JSON of the secret bag (never stored plaintext)
    dataEnc: text("data_enc").notNull(),
    spaceId: text("space_id").references(() => spaces.id, { onDelete: "cascade" }),
    createdAt: iso("created_at").notNull().defaultNow(),
  },
  (t) => [index("credentials_created_idx").on(t.createdAt), index("credentials_space_idx").on(t.spaceId)],
);

export const schedulerState = pgTable("scheduler_state", {
  workflowId: text("workflow_id").primaryKey(),
  lastFiredMinute: text("last_fired_minute").notNull(),
});

export type DbUser = typeof users.$inferSelect;
export type DbSession = typeof sessions.$inferSelect;
export type DbSpace = typeof spaces.$inferSelect;
export type DbStory = typeof stories.$inferSelect;
