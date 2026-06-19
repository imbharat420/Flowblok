// Workflow engine data source — node-type catalog + workflow definitions.
// The n8n/Boomi-style engine is abstracted behind this; the UI never sees n8n directly.

import type { CreateWorkflowInput, NodeType, UpdateWorkflowInput, Workflow } from "@/lib/types";

const NODE_TYPES: NodeType[] = [
  {
    type: "webhook", label: "Webhook", icon: "Webhook", kind: "trigger", category: "Triggers",
    description: "Start when an HTTP request arrives.",
    params: [
      { key: "path", label: "Path", type: "text", placeholder: "/orders-paid", hint: "Listens at /api/hooks/<path>." },
      { key: "method", label: "HTTP method", type: "select", options: ["GET", "POST", "PUT", "DELETE"], default: "POST" },
    ],
  },
  {
    type: "schedule", label: "Schedule", icon: "Clock", kind: "trigger", category: "Triggers",
    description: "Run on a cron schedule.",
    params: [
      { key: "cron", label: "Cron expression", type: "text", placeholder: "0 9 * * 1", default: "0 9 * * *", hint: "min hour day month weekday" },
      { key: "timezone", label: "Timezone", type: "text", placeholder: "UTC", default: "UTC" },
    ],
  },
  {
    type: "form_submit", label: "Form Submitted", icon: "FileInput", kind: "trigger", category: "Triggers",
    description: "Start when a Flowblok form is submitted.",
    params: [{ key: "formId", label: "Form ID", type: "text", placeholder: "contact-form" }],
  },

  {
    type: "if", label: "If / Condition", icon: "GitBranch", kind: "logic", category: "Logic",
    description: "Branch on a condition.",
    params: [
      { key: "left", label: "Value", type: "text", placeholder: "{{ $json.email }}" },
      { key: "operator", label: "Operator", type: "select", options: ["equals", "not equals", "contains", "greater than", "less than", "is empty"], default: "equals" },
      { key: "right", label: "Compare to", type: "text", placeholder: "value" },
    ],
  },
  {
    type: "loop", label: "Loop", icon: "Repeat", kind: "logic", category: "Logic",
    description: "Iterate over items.",
    params: [
      { key: "items", label: "Items", type: "text", placeholder: "{{ $json.items }}" },
      { key: "batchSize", label: "Batch size", type: "number", default: 1 },
    ],
  },
  {
    type: "code", label: "Code", icon: "Code", kind: "logic", category: "Logic",
    description: "Run custom JS.",
    params: [
      { key: "language", label: "Language", type: "select", options: ["JavaScript"], default: "JavaScript" },
      { key: "code", label: "Code", type: "textarea", placeholder: "return items;", default: "return items;" },
    ],
  },
  {
    type: "wait", label: "Wait", icon: "Timer", kind: "logic", category: "Logic",
    description: "Delay execution.",
    params: [
      { key: "amount", label: "Amount", type: "number", default: 5 },
      { key: "unit", label: "Unit", type: "select", options: ["seconds", "minutes", "hours"], default: "seconds" },
    ],
  },

  {
    type: "db_write", label: "Database", icon: "Database", kind: "action", category: "Actions",
    description: "Create or update a record.",
    params: [
      { key: "table", label: "Table", type: "text", placeholder: "orders" },
      { key: "operation", label: "Operation", type: "select", options: ["insert", "update", "upsert"], default: "insert" },
    ],
  },
  {
    type: "send_email", label: "Send Email", icon: "Mail", kind: "action", category: "Actions",
    description: "Send a templated email.",
    params: [
      { key: "to", label: "To", type: "text", placeholder: "{{ $json.email }}" },
      { key: "subject", label: "Subject", type: "text", placeholder: "Welcome!" },
      { key: "body", label: "Body", type: "textarea", placeholder: "Hi {{ $json.name }}…" },
    ],
  },
  {
    type: "send_sms", label: "Send SMS", icon: "MessageSquare", kind: "action", category: "Actions",
    description: "Send an SMS.",
    params: [
      { key: "to", label: "To", type: "text", placeholder: "+1…" },
      { key: "message", label: "Message", type: "textarea", placeholder: "Your code is…" },
    ],
  },
  {
    type: "http", label: "HTTP Request", icon: "Globe", kind: "action", category: "Actions",
    description: "Call any API.",
    params: [
      { key: "method", label: "Method", type: "select", options: ["GET", "POST", "PUT", "PATCH", "DELETE"], default: "GET" },
      { key: "url", label: "URL", type: "text", placeholder: "https://api.example.com/v1/…" },
      { key: "body", label: "Body (JSON)", type: "textarea", placeholder: "{ \"key\": \"value\" }" },
    ],
  },

  {
    type: "crm_lead", label: "Create CRM Lead", icon: "Contact", kind: "integration", category: "Integrations",
    description: "Create a lead in the CRM.",
    params: [
      { key: "name", label: "Name", type: "text", placeholder: "{{ $json.name }}" },
      { key: "email", label: "Email", type: "text", placeholder: "{{ $json.email }}" },
      { key: "source", label: "Source", type: "text", placeholder: "website" },
    ],
  },
  {
    type: "stripe", label: "Stripe", icon: "CreditCard", kind: "integration", category: "Integrations",
    description: "Charge or sync with Stripe.",
    params: [
      { key: "action", label: "Action", type: "select", options: ["charge", "refund", "sync customer"], default: "charge" },
      { key: "amount", label: "Amount (cents)", type: "number", placeholder: "1999" },
    ],
  },
  {
    type: "slack", label: "Slack", icon: "Hash", kind: "integration", category: "Integrations",
    description: "Post to a Slack channel.",
    params: [
      { key: "channel", label: "Channel", type: "text", placeholder: "#sales", default: "#general" },
      { key: "message", label: "Message", type: "textarea", placeholder: "New lead: {{ $json.name }}" },
    ],
  },
];

const SEED_WORKFLOWS: Workflow[] = [
  {
    id: "wf_lead_router",
    name: "Lead Router",
    status: "active",
    lastRun: "2026-06-16T08:02:00Z",
    runs: 1284,
    nodes: [
      { id: "n1", type: "form_submit", name: "Contact form", x: 40, y: 140 },
      { id: "n2", type: "if", name: "Valid email?", x: 280, y: 140 },
      { id: "n3", type: "crm_lead", name: "Create CRM Lead", x: 520, y: 60 },
      { id: "n4", type: "send_email", name: "Welcome email", x: 760, y: 60 },
      { id: "n5", type: "slack", name: "Notify #sales", x: 520, y: 240 },
    ],
    connections: [
      { id: "c1", from: "n1", to: "n2" },
      { id: "c2", from: "n2", to: "n3" },
      { id: "c3", from: "n3", to: "n4" },
      { id: "c4", from: "n2", to: "n5" },
    ],
  },
  {
    id: "wf_order_fulfilment",
    name: "Order Fulfilment",
    status: "active",
    lastRun: "2026-06-16T07:41:00Z",
    runs: 642,
    nodes: [
      { id: "m1", type: "webhook", name: "Order paid", x: 40, y: 140 },
      { id: "m2", type: "db_write", name: "Update inventory", x: 300, y: 140 },
      { id: "m3", type: "send_email", name: "Receipt", x: 560, y: 140 },
    ],
    connections: [
      { id: "d1", from: "m1", to: "m2" },
      { id: "d2", from: "m2", to: "m3" },
    ],
  },
  {
    id: "wf_nurture",
    name: "Lead Nurture (draft)",
    status: "draft",
    lastRun: null,
    runs: 0,
    nodes: [{ id: "p1", type: "schedule", name: "Every Monday", x: 40, y: 140 }],
    connections: [],
  },
];

// Pin the mutable workflow list on globalThis. In Next.js dev, route-handler
// files are separate bundles that can each hold their own copy of a plain
// module-level array — so a workflow created via one route wouldn't be found
// by another. A single global array keeps create/update/delete consistent
// across every route handler and survives HMR re-evaluation.
const globalStore = globalThis as unknown as { __flowblokWorkflows?: Workflow[] };
const WORKFLOWS: Workflow[] = (globalStore.__flowblokWorkflows ??= SEED_WORKFLOWS);

export class WorkflowsRepository {
  nodeTypes(): NodeType[] {
    return NODE_TYPES;
  }
  findAll(): Workflow[] {
    return WORKFLOWS;
  }
  findById(id: string): Workflow | undefined {
    return WORKFLOWS.find((w) => w.id === id);
  }

  create(input: CreateWorkflowInput): Workflow {
    const wf: Workflow = {
      id: "wf_" + Date.now().toString(36),
      name: input.name,
      status: "draft",
      nodes: input.nodes ?? [],
      connections: input.connections ?? [],
      lastRun: null,
      runs: 0,
    };
    WORKFLOWS.unshift(wf);
    return wf;
  }

  update(id: string, patch: UpdateWorkflowInput): Workflow | undefined {
    const idx = WORKFLOWS.findIndex((w) => w.id === id);
    if (idx === -1) return undefined;
    WORKFLOWS[idx] = { ...WORKFLOWS[idx], ...patch };
    return WORKFLOWS[idx];
  }

  remove(id: string): Workflow | undefined {
    const idx = WORKFLOWS.findIndex((w) => w.id === id);
    if (idx === -1) return undefined;
    const [removed] = WORKFLOWS.splice(idx, 1);
    return removed;
  }
}

export const workflowsRepository = new WorkflowsRepository();
