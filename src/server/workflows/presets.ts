// Workflow preset templates (inspired by n8n's template gallery at
// https://n8n.io/workflows/). Each preset is a ready-to-run workflow built from
// node types this engine actually supports, so instantiating one and clicking
// "Test workflow" works end-to-end. Grouped by category for the gallery UI.

import type { WorkflowConnection, WorkflowNode } from "@/lib/types";

export interface WorkflowPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export const PRESET_CATEGORIES = [
  "AI",
  "Sales & CRM",
  "Marketing",
  "Productivity",
  "DevOps & IT",
  "E-commerce",
] as const;

export const WORKFLOW_PRESETS: WorkflowPreset[] = [
  // ── AI ──────────────────────────────────────────────────────────────────
  {
    id: "tpl_ai_chatbot",
    name: "AI Chatbot with Memory",
    description: "Manual trigger → AI Agent with an Anthropic chat model and conversation memory.",
    category: "AI",
    nodes: [
      { id: "t", type: "manual_trigger", name: "When clicking 'Test workflow'", x: 60, y: 200 },
      { id: "a", type: "ai_agent", name: "AI Agent", x: 320, y: 200, config: { prompt: "{{ $json.message }}", system: "You are a friendly support assistant." } },
      { id: "m", type: "chat_anthropic", name: "Anthropic Chat Model", x: 280, y: 380, config: { model: "claude-opus-4-8", temperature: 0.7 } },
      { id: "mem", type: "memory_simple", name: "Simple Memory", x: 480, y: 380, config: { contextWindowLength: 5 } },
    ],
    connections: [
      { id: "c1", from: "t", to: "a" },
      { id: "c2", from: "m", to: "a", toPort: "ai_model" },
      { id: "c3", from: "mem", to: "a", toPort: "ai_memory" },
    ],
  },
  {
    id: "tpl_summarize_page",
    name: "Summarize a Web Page with AI",
    description: "Fetch a URL, then have an AI Agent summarize the page content.",
    category: "AI",
    nodes: [
      { id: "t", type: "manual_trigger", name: "When clicking 'Test workflow'", x: 60, y: 180 },
      { id: "h", type: "http", name: "Fetch page", x: 300, y: 180, config: { method: "GET", url: "https://example.com" } },
      { id: "a", type: "ai_agent", name: "Summarize", x: 560, y: 180, config: { prompt: "Summarize this content in 3 bullets:\n{{ $json.body }}" } },
      { id: "m", type: "chat_anthropic", name: "Anthropic Chat Model", x: 520, y: 360, config: { model: "claude-sonnet-4-6" } },
    ],
    connections: [
      { id: "c1", from: "t", to: "h" },
      { id: "c2", from: "h", to: "a" },
      { id: "c3", from: "m", to: "a", toPort: "ai_model" },
    ],
  },
  {
    id: "tpl_ai_lead_enrich",
    name: "Enrich Inbound Lead with AI",
    description: "Webhook receives a lead, an AI Agent enriches it, then it's saved to the CRM.",
    category: "AI",
    nodes: [
      { id: "w", type: "webhook", name: "New lead", x: 60, y: 180, config: { path: "lead", method: "POST" } },
      { id: "a", type: "ai_agent", name: "Enrich lead", x: 320, y: 180, config: { prompt: "Classify this lead and suggest a next step:\n{{ $json.body }}" } },
      { id: "m", type: "chat_anthropic", name: "Anthropic Chat Model", x: 280, y: 360 },
      { id: "crm", type: "crm_lead", name: "Create CRM Lead", x: 580, y: 180, config: { name: "{{ $json.body.name }}", email: "{{ $json.body.email }}", source: "webhook" } },
    ],
    connections: [
      { id: "c1", from: "w", to: "a" },
      { id: "c2", from: "m", to: "a", toPort: "ai_model" },
      { id: "c3", from: "a", to: "crm" },
    ],
  },

  // ── Sales & CRM ───────────────────────────────────────────────────────────
  {
    id: "tpl_lead_router",
    name: "Lead Router",
    description: "Form submission → validate email → create CRM lead + welcome email, or notify Slack.",
    category: "Sales & CRM",
    nodes: [
      { id: "f", type: "form_submit", name: "Contact form", x: 40, y: 180, config: { formId: "contact-form" } },
      { id: "i", type: "if", name: "Valid email?", x: 280, y: 180, config: { left: "{{ $json.email }}", operator: "contains", right: "@" } },
      { id: "crm", type: "crm_lead", name: "Create CRM Lead", x: 540, y: 80, config: { name: "{{ $json.name }}", email: "{{ $json.email }}", source: "form" } },
      { id: "mail", type: "send_email", name: "Welcome email", x: 800, y: 80, config: { to: "{{ $json.email }}", subject: "Welcome!", body: "Hi {{ $json.name }}, thanks for reaching out." } },
      { id: "s", type: "slack", name: "Notify #sales", x: 540, y: 300, config: { channel: "#sales", message: "Invalid lead from form" } },
    ],
    connections: [
      { id: "c1", from: "f", to: "i" },
      { id: "c2", from: "i", to: "crm", fromPort: "true" },
      { id: "c3", from: "crm", to: "mail" },
      { id: "c4", from: "i", to: "s", fromPort: "false" },
    ],
  },
  {
    id: "tpl_new_lead_slack",
    name: "New Lead → Slack Alert",
    description: "Webhook receives a new lead and posts an alert to a Slack channel.",
    category: "Sales & CRM",
    nodes: [
      { id: "w", type: "webhook", name: "New lead", x: 80, y: 180, config: { path: "new-lead", method: "POST" } },
      { id: "s", type: "slack", name: "Post to #sales", x: 360, y: 180, config: { channel: "#sales", message: "🎯 New lead: {{ $json.body.name }} ({{ $json.body.email }})" } },
    ],
    connections: [{ id: "c1", from: "w", to: "s" }],
  },

  // ── Marketing ───────────────────────────────────────────────────────────
  {
    id: "tpl_sms_on_signup",
    name: "Send SMS on Signup",
    description: "Form submission triggers a welcome SMS.",
    category: "Marketing",
    nodes: [
      { id: "f", type: "form_submit", name: "Signup form", x: 80, y: 180, config: { formId: "signup" } },
      { id: "sms", type: "send_sms", name: "Welcome SMS", x: 360, y: 180, config: { to: "{{ $json.phone }}", message: "Welcome {{ $json.name }}! 🎉" } },
    ],
    connections: [{ id: "c1", from: "f", to: "sms" }],
  },
  {
    id: "tpl_rss_to_slack",
    name: "Daily Digest → Slack",
    description: "On a schedule, fetch items from an API, format them, and post to Slack.",
    category: "Marketing",
    nodes: [
      { id: "sch", type: "schedule", name: "Every morning 9am", x: 40, y: 180, config: { cron: "0 9 * * *", timezone: "UTC" } },
      { id: "h", type: "http", name: "Fetch items", x: 300, y: 180, config: { method: "GET", url: "https://dummyjson.com/posts?limit=5" } },
      { id: "code", type: "code", name: "Format digest", x: 560, y: 180, config: { code: "return (items[0].body.posts || []).map(p => ({ title: p.title }));" } },
      { id: "s", type: "slack", name: "Post digest", x: 820, y: 180, config: { channel: "#updates", message: "📰 {{ $json.title }}" } },
    ],
    connections: [
      { id: "c1", from: "sch", to: "h" },
      { id: "c2", from: "h", to: "code" },
      { id: "c3", from: "code", to: "s" },
    ],
  },

  // ── Productivity ──────────────────────────────────────────────────────────
  {
    id: "tpl_standup",
    name: "Daily Standup Reminder",
    description: "Posts a standup reminder to Slack every weekday morning.",
    category: "Productivity",
    nodes: [
      { id: "sch", type: "schedule", name: "Weekdays 9:30am", x: 80, y: 180, config: { cron: "30 9 * * 1-5", timezone: "UTC" } },
      { id: "s", type: "slack", name: "Standup reminder", x: 360, y: 180, config: { channel: "#team", message: "☀️ Standup in 5 minutes — drop your updates!" } },
    ],
    connections: [{ id: "c1", from: "sch", to: "s" }],
  },
  {
    id: "tpl_webhook_to_db",
    name: "Capture Webhook to Database",
    description: "Receive a webhook payload and store it as a database record.",
    category: "Productivity",
    nodes: [
      { id: "w", type: "webhook", name: "Incoming event", x: 80, y: 180, config: { path: "event", method: "POST" } },
      { id: "db", type: "db_write", name: "Save event", x: 360, y: 180, config: { table: "events", operation: "insert" } },
    ],
    connections: [{ id: "c1", from: "w", to: "db" }],
  },

  // ── DevOps & IT ───────────────────────────────────────────────────────────
  {
    id: "tpl_health_check",
    name: "API Health Check + Alert",
    description: "On a schedule, ping an endpoint; if it's not OK, alert Slack.",
    category: "DevOps & IT",
    nodes: [
      { id: "sch", type: "schedule", name: "Every 5 minutes", x: 40, y: 200, config: { cron: "*/5 * * * *", timezone: "UTC" } },
      { id: "h", type: "http", name: "Ping API", x: 300, y: 200, config: { method: "GET", url: "https://dummyjson.com/test" } },
      { id: "i", type: "if", name: "Down?", x: 560, y: 200, config: { left: "{{ $json.ok }}", operator: "equals", right: "false" } },
      { id: "s", type: "slack", name: "Alert #ops", x: 820, y: 120, config: { channel: "#ops", message: "🚨 API health check failed (status {{ $json.status }})" } },
    ],
    connections: [
      { id: "c1", from: "sch", to: "h" },
      { id: "c2", from: "h", to: "i" },
      { id: "c3", from: "i", to: "s", fromPort: "true" },
    ],
  },
  {
    id: "tpl_error_guard",
    name: "Validate Payload or Stop",
    description: "Reject requests missing a required field by throwing a workflow error.",
    category: "DevOps & IT",
    nodes: [
      { id: "w", type: "webhook", name: "Request", x: 60, y: 200, config: { path: "validate", method: "POST" } },
      { id: "i", type: "if", name: "Missing name?", x: 320, y: 200, config: { left: "{{ $json.body.name }}", operator: "is empty", right: "" } },
      { id: "err", type: "stop_error", name: "Reject", x: 580, y: 120, config: { errorType: "Error Message", errorMessage: "Field 'name' is required" } },
      { id: "db", type: "db_write", name: "Save", x: 580, y: 300, config: { table: "records", operation: "insert" } },
    ],
    connections: [
      { id: "c1", from: "w", to: "i" },
      { id: "c2", from: "i", to: "err", fromPort: "true" },
      { id: "c3", from: "i", to: "db", fromPort: "false" },
    ],
  },

  // ── E-commerce ─────────────────────────────────────────────────────────────
  {
    id: "tpl_order_fulfilment",
    name: "Order Fulfilment",
    description: "Webhook on paid order → update inventory → send receipt email.",
    category: "E-commerce",
    nodes: [
      { id: "w", type: "webhook", name: "Order paid", x: 40, y: 180, config: { path: "orders-paid", method: "POST" } },
      { id: "db", type: "db_write", name: "Update inventory", x: 300, y: 180, config: { table: "inventory", operation: "update", matchField: "sku" } },
      { id: "mail", type: "send_email", name: "Receipt", x: 560, y: 180, config: { to: "{{ $json.body.email }}", subject: "Your receipt", body: "Thanks for your order!" } },
    ],
    connections: [
      { id: "c1", from: "w", to: "db" },
      { id: "c2", from: "db", to: "mail" },
    ],
  },
];
