// Workflow engine data source — node-type catalog + workflow definitions.
// The n8n/Boomi-style engine is abstracted behind this; the UI never sees n8n directly.

import type { NodeType, Workflow } from "@/lib/types";

const NODE_TYPES: NodeType[] = [
  { type: "webhook", label: "Webhook", icon: "Webhook", kind: "trigger", category: "Triggers", description: "Start when an HTTP request arrives." },
  { type: "schedule", label: "Schedule", icon: "Clock", kind: "trigger", category: "Triggers", description: "Run on a cron schedule." },
  { type: "form_submit", label: "Form Submitted", icon: "FileInput", kind: "trigger", category: "Triggers", description: "Start when a Flowblok form is submitted." },

  { type: "if", label: "If / Condition", icon: "GitBranch", kind: "logic", category: "Logic", description: "Branch on a condition." },
  { type: "loop", label: "Loop", icon: "Repeat", kind: "logic", category: "Logic", description: "Iterate over items." },
  { type: "code", label: "Code", icon: "Code", kind: "logic", category: "Logic", description: "Run custom JS." },
  { type: "wait", label: "Wait", icon: "Timer", kind: "logic", category: "Logic", description: "Delay execution." },

  { type: "db_write", label: "Database", icon: "Database", kind: "action", category: "Actions", description: "Create or update a record." },
  { type: "send_email", label: "Send Email", icon: "Mail", kind: "action", category: "Actions", description: "Send a templated email." },
  { type: "send_sms", label: "Send SMS", icon: "MessageSquare", kind: "action", category: "Actions", description: "Send an SMS." },
  { type: "http", label: "HTTP Request", icon: "Globe", kind: "action", category: "Actions", description: "Call any API." },

  { type: "crm_lead", label: "Create CRM Lead", icon: "Contact", kind: "integration", category: "Integrations", description: "Create a lead in the CRM." },
  { type: "stripe", label: "Stripe", icon: "CreditCard", kind: "integration", category: "Integrations", description: "Charge or sync with Stripe." },
  { type: "slack", label: "Slack", icon: "Hash", kind: "integration", category: "Integrations", description: "Post to a Slack channel." },
];

const WORKFLOWS: Workflow[] = [
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
}

export const workflowsRepository = new WorkflowsRepository();
