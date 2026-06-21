// Workflow engine data source — node-type catalog + workflow definitions.
// The n8n/Boomi-style engine is abstracted behind this; the UI never sees n8n directly.

import type { CreateWorkflowInput, NodeType, UpdateWorkflowInput, Workflow, WorkflowStatus } from "@/lib/types";
import { AI_SUB_NODES } from "@/lib/ai-catalog";
import { WORKFLOW_PRESETS, type WorkflowPreset } from "./presets";
import { getDb } from "@/server/db/client";
import { workflows as wfTable } from "@/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";

/** Ownership context applied when a workflow is created (space + account). */
export interface WorkflowOwner {
  spaceId?: string | null;
  ownerId?: string | null;
}

// AI sub-node catalog (Chat Models / Memory / Tools) → NodeType entries. These
// are NOT shown in the main add-node panel; they appear only in the AI Agent's
// sub-port picker, sub-grouped by `subgroup` (e.g. "Recommended Tools").
const AI_SUB_NODE_TYPES: NodeType[] = AI_SUB_NODES.map((d) => ({
  type: d.type, label: d.label, icon: d.icon, kind: "action", category: "AI",
  subcategory: d.subgroup, subPort: d.subPort,
  description: d.description, params: d.params,
}));

// ── Action in an app — popular integrations ────────────────────────────────
// Each integration is one node whose "operation" select holds its actions
// (the add-node panel surfaces those as a third drill-down level).
function app(type: string, label: string, icon: string, description: string, operations: string[]): NodeType {
  return {
    type, label, icon, kind: "integration", category: "Integrations", actionParam: "operation", description,
    params: [
      { key: "operation", label: "Operation", type: "select", options: operations, default: operations[0] },
      { key: "credential", label: "Credential", type: "credential", credentialType: type },
    ],
  };
}

const APP_INTEGRATIONS: NodeType[] = [
  app("google_sheets", "Google Sheets", "Sheet", "Read, append or update rows in a Google Sheet.", ["Append row", "Read rows", "Update row", "Delete row", "Clear sheet"]),
  app("gmail", "Gmail", "Mail", "Send and manage Gmail messages.", ["Send", "Reply", "Get", "Get many", "Add label", "Mark as read"]),
  app("google_calendar", "Google Calendar", "Calendar", "Create and manage calendar events.", ["Create event", "Get events", "Update event", "Delete event"]),
  app("google_drive", "Google Drive", "HardDrive", "Upload, download and share files.", ["Upload file", "Download file", "Copy file", "Delete file", "Share file"]),
  app("notion", "Notion", "BookOpen", "Work with Notion pages and databases.", ["Create page", "Update page", "Get page", "Query database", "Append block"]),
  app("airtable", "Airtable", "Table", "Read and write Airtable records.", ["Create record", "Read records", "Update record", "Delete record"]),
  app("telegram", "Telegram", "Send", "Send messages and files via a Telegram bot.", ["Send message", "Send photo", "Send document", "Edit message"]),
  app("discord", "Discord", "MessageCircle", "Post messages to a Discord channel.", ["Send message", "Send embed", "Create webhook message"]),
  app("hubspot", "HubSpot", "Contact", "Manage HubSpot CRM objects.", ["Create contact", "Update contact", "Get contact", "Create deal", "Create company"]),
  app("salesforce", "Salesforce", "Cloud", "Manage Salesforce records.", ["Create record", "Update record", "Get record", "Run SOQL query"]),
  app("trello", "Trello", "Trello", "Manage Trello boards and cards.", ["Create card", "Update card", "Move card", "Add comment"]),
  app("asana", "Asana", "CircleCheck", "Manage Asana tasks and projects.", ["Create task", "Update task", "Get task", "Add comment"]),
  app("jira", "Jira", "BadgeCheck", "Create and update Jira issues.", ["Create issue", "Update issue", "Get issue", "Add comment", "Transition issue"]),
  app("github", "GitHub", "Github", "Work with GitHub issues, PRs and repos.", ["Create issue", "Create comment", "Get repo", "Create release", "List PRs"]),
  app("gitlab", "GitLab", "Gitlab", "Work with GitLab issues and pipelines.", ["Create issue", "Get pipeline", "Create comment", "List MRs"]),
  app("twilio", "Twilio", "Phone", "Send SMS and WhatsApp messages.", ["Send SMS", "Send WhatsApp", "Make call"]),
  app("sendgrid", "SendGrid", "Send", "Send transactional email via SendGrid.", ["Send email", "Add contact", "Send template"]),
  app("mailchimp", "Mailchimp", "Mail", "Manage Mailchimp audiences and campaigns.", ["Add subscriber", "Update subscriber", "Add tag", "Send campaign"]),
  app("shopify", "Shopify", "ShoppingBag", "Manage Shopify orders and products.", ["Create product", "Get orders", "Update inventory", "Create customer"]),
  app("dropbox", "Dropbox", "Package", "Upload and download Dropbox files.", ["Upload file", "Download file", "Create folder", "List folder"]),
  app("microsoft_teams", "Microsoft Teams", "Users", "Post messages to Microsoft Teams.", ["Send channel message", "Send chat message", "Create channel"]),
  app("zendesk", "Zendesk", "LifeBuoy", "Manage Zendesk support tickets.", ["Create ticket", "Update ticket", "Get ticket", "Add comment"]),
];

// ── Data transformation ────────────────────────────────────────────────────
function dt(type: string, label: string, icon: string, subcategory: string, description: string, params: NodeType["params"] = []): NodeType {
  return { type, label, icon, kind: "action", category: "Data transformation", subcategory, description, params };
}

const DATA_TRANSFORM_NODES: NodeType[] = [
  dt("ai_transform", "AI Transform", "Wand", "Popular", "Modify data based on instructions written in plain english.", [
    { key: "instruction", label: "Instruction", type: "textarea", placeholder: "Capitalize every name and drop empty fields" },
  ]),
  dt("datetime", "Date & Time", "Clock", "Popular", "Manipulate date and time values.", [
    { key: "operation", label: "Operation", type: "select", options: ["Add to date", "Subtract from date", "Format date", "Get current date", "Get time between dates"], default: "Format date" },
    { key: "value", label: "Date", type: "text", placeholder: "{{ $json.createdAt }}" },
  ]),
  dt("set", "Edit Fields (Set)", "Pencil", "Popular", "Modify, add, or remove item fields.", [
    { key: "mode", label: "Mode", type: "select", options: ["Manual mapping", "JSON"], default: "Manual mapping" },
    { key: "fields", label: "Fields to set (JSON)", type: "textarea", placeholder: "{ \"status\": \"new\" }" },
    { key: "keepOnlySet", label: "Keep only set fields", type: "boolean", default: false },
  ]),
  dt("filter_dt", "Filter", "Filter", "Add or remove items", "Keep only items matching a condition.", [
    { key: "left", label: "Value", type: "text", placeholder: "{{ $json.status }}" },
    { key: "operator", label: "Operator", type: "select", options: ["equals", "not equals", "contains", "greater than", "less than", "is empty"], default: "equals" },
    { key: "right", label: "Compare to", type: "text", placeholder: "active" },
  ]),
  dt("limit", "Limit", "Scissors", "Add or remove items", "Restrict the number of items.", [
    { key: "maxItems", label: "Max items", type: "number", default: 10 },
    { key: "keep", label: "Keep", type: "select", options: ["First items", "Last items"], default: "First items" },
  ]),
  dt("remove_duplicates", "Remove Duplicates", "CopyMinus", "Add or remove items", "Delete items with matching field values.", [
    { key: "compareField", label: "Compare on field", type: "text", placeholder: "id" },
  ]),
  dt("split_out", "Split Out", "Split", "Add or remove items", "Turn a list inside item(s) into separate items.", [
    { key: "field", label: "Field to split out", type: "text", placeholder: "{{ $json.items }}" },
  ]),
  dt("aggregate", "Aggregate", "Layers", "Combine items", "Combine a field from many items into a list in a single item.", [
    { key: "field", label: "Field to aggregate", type: "text", placeholder: "email" },
    { key: "outputField", label: "Output field name", type: "text", default: "data" },
  ]),
  dt("merge_dt", "Merge", "GitMerge", "Combine items", "Merge data of multiple streams once data from both is available.", [
    { key: "mode", label: "Mode", type: "select", options: ["Append", "Combine", "Choose Branch"], default: "Append" },
  ]),
  dt("summarize", "Summarize", "Sigma", "Combine items", "Sum, count, max, etc. across items.", [
    { key: "operation", label: "Operation", type: "select", options: ["Sum", "Count", "Average", "Min", "Max", "Concatenate"], default: "Sum" },
    { key: "field", label: "Field", type: "text", placeholder: "amount" },
  ]),
  dt("compression", "Compression", "Archive", "Convert data", "Compress and decompress files.", [
    { key: "operation", label: "Operation", type: "select", options: ["Compress", "Decompress"], default: "Compress" },
    { key: "format", label: "Format", type: "select", options: ["gzip", "zip"], default: "gzip" },
  ]),
  dt("convert_to_file", "Convert to File", "FileOutput", "Convert data", "Convert JSON data to binary data.", [
    { key: "format", label: "Format", type: "select", options: ["CSV", "JSON", "Text", "XLSX"], default: "CSV" },
  ]),
  dt("crypto", "Crypto", "KeyRound", "Convert data", "Provide cryptographic utilities.", [
    { key: "action", label: "Action", type: "select", options: ["Hash", "HMAC", "Sign", "Random string"], default: "Hash" },
    { key: "algorithm", label: "Algorithm", type: "select", options: ["SHA256", "SHA512", "MD5"], default: "SHA256" },
  ]),
  dt("edit_image", "Edit Image", "Image", "Convert data", "Edit an image like blur, resize or adding border and text.", [
    { key: "operation", label: "Operation", type: "select", options: ["Resize", "Blur", "Rotate", "Add text", "Add border"], default: "Resize" },
  ]),
  dt("extract_from_file", "Extract from File", "FileInput", "Convert data", "Convert binary data to JSON.", [
    { key: "format", label: "Source format", type: "select", options: ["CSV", "JSON", "XLSX", "PDF", "Text"], default: "CSV" },
  ]),
  dt("html", "HTML", "Code2", "Convert data", "Work with HTML.", [
    { key: "operation", label: "Operation", type: "select", options: ["Extract", "Generate HTML template"], default: "Extract" },
  ]),
  dt("markdown", "Markdown", "FileText", "Convert data", "Convert data between Markdown and HTML.", [
    { key: "mode", label: "Mode", type: "select", options: ["Markdown to HTML", "HTML to Markdown"], default: "Markdown to HTML" },
  ]),
  dt("xml", "XML", "FileCode", "Convert data", "Convert data from and to XML.", [
    { key: "mode", label: "Mode", type: "select", options: ["XML to JSON", "JSON to XML"], default: "XML to JSON" },
  ]),
  dt("rename_keys", "Rename Keys", "TextCursorInput", "Other", "Update item field names.", [
    { key: "mappings", label: "Renames (JSON)", type: "textarea", placeholder: "{ \"old\": \"new\" }" },
  ]),
  dt("sort", "Sort", "ArrowUpDown", "Other", "Change items order.", [
    { key: "field", label: "Sort by field", type: "text", placeholder: "createdAt" },
    { key: "order", label: "Order", type: "select", options: ["Ascending", "Descending"], default: "Ascending" },
  ]),
];

// ── AI root nodes (providers, chains, misc) — the "AI Nodes" panel ──────────
function aiNode(type: string, label: string, icon: string, subcategory: string, description: string, params: NodeType["params"] = [{ key: "prompt", label: "Prompt", type: "textarea", placeholder: "{{ $json.text }}" }]): NodeType {
  return { type, label, icon, kind: "action", category: "AI", subcategory, description, params };
}

const AI_ROOT_NODES: NodeType[] = [
  // Provider app nodes (standalone — distinct from the Chat Model sub-nodes)
  {
    type: "openai_node", label: "OpenAI", icon: "Bot", kind: "action", category: "AI", subcategory: "Models",
    description: "Message an assistant or GPT, analyze images, generate audio, etc.", actionParam: "resource",
    params: [
      { key: "resource", label: "Resource", type: "select", options: ["Message a model", "Analyze image", "Generate audio", "Generate image", "Assistant", "Transcribe audio"], default: "Message a model" },
      { key: "prompt", label: "Prompt", type: "textarea", placeholder: "{{ $json.text }}" },
    ],
  },
  aiNode("anthropic_node", "Anthropic", "Sparkles", "Models", "Interact with Anthropic AI models."),
  aiNode("gemini_node", "Google Gemini", "Sparkles", "Models", "Interact with Google Gemini AI models."),
  aiNode("alibaba_node", "Alibaba Cloud Model Studio", "Cloud", "Models", "Interact with Alibaba Cloud Qwen models via Model Studio."),
  aiNode("minimax_node", "MiniMax", "Cpu", "Models", "Interact with MiniMax AI models."),
  aiNode("moonshot_node", "Moonshot Kimi", "Cpu", "Models", "Interact with Moonshot Kimi AI models."),
  aiNode("ollama_node", "Ollama", "Server", "Models", "Interact with Ollama AI models."),
  // Chains
  aiNode("basic_llm_chain", "Basic LLM Chain", "Link", "Chains", "A simple chain to prompt a large language model."),
  aiNode("information_extractor", "Information Extractor", "ScanText", "Chains", "Extract information from text in a structured format.", [
    { key: "text", label: "Text", type: "textarea", placeholder: "{{ $json.text }}" },
    { key: "schema", label: "Attributes (JSON schema)", type: "textarea", placeholder: "{ \"name\": \"string\", \"email\": \"string\" }" },
  ]),
  aiNode("qa_chain", "Question and Answer Chain", "MessagesSquare", "Chains", "Answer questions about retrieved documents.", [
    { key: "question", label: "Question", type: "textarea", placeholder: "{{ $json.question }}" },
  ]),
  aiNode("sentiment_analysis", "Sentiment Analysis", "Smile", "Chains", "Analyze the sentiment of your text.", [
    { key: "text", label: "Text", type: "textarea", placeholder: "{{ $json.text }}" },
    { key: "categories", label: "Sentiments", type: "text", default: "Positive, Neutral, Negative" },
  ]),
  aiNode("summarization_chain", "Summarization Chain", "FileText", "Chains", "Transforms text into a concise summary.", [
    { key: "text", label: "Text", type: "textarea", placeholder: "{{ $json.text }}" },
  ]),
  aiNode("text_classifier", "Text Classifier", "Tags", "Chains", "Classify your text into distinct categories.", [
    { key: "text", label: "Text", type: "textarea", placeholder: "{{ $json.text }}" },
    { key: "categories", label: "Categories", type: "textarea", placeholder: "support, sales, billing" },
  ]),
  // Miscellaneous
  aiNode("guardrails", "Guardrails", "ShieldCheck", "Miscellaneous", "Safeguard AI models from malicious input or prevent them from generating undesirable responses.", [
    { key: "checks", label: "Checks", type: "textarea", placeholder: "No PII, no profanity, stay on topic" },
  ]),
  aiNode("ai_transform_node", "AI Transform", "Wand", "Miscellaneous", "Modify data based on instructions written in plain english.", [
    { key: "instruction", label: "Instruction", type: "textarea", placeholder: "Capitalize every name and drop empty fields" },
  ]),
  aiNode("evaluation", "Evaluation", "ClipboardCheck", "Miscellaneous", "Runs an evaluation.", [
    { key: "metric", label: "Metric", type: "select", options: ["Correctness", "Helpfulness", "String match", "Custom"], default: "Correctness" },
  ]),
  // Other AI nodes
  aiNode("embeddings", "Embeddings", "Boxes", "Other AI Nodes", "Generate vector embeddings from text.", [
    { key: "text", label: "Text", type: "textarea", placeholder: "{{ $json.text }}" },
  ]),
  aiNode("vector_store_node", "Vector Store", "Boxes", "Other AI Nodes", "Store and query vector data in services like Supabase, Pinecone and MongoDB.", [
    { key: "operation", label: "Operation", type: "select", options: ["Insert", "Retrieve"], default: "Retrieve" },
  ]),
  aiNode("llm_node", "LLM", "Cpu", "Other AI Nodes", "Call a text-completion LLM.", [
    { key: "prompt", label: "Prompt", type: "textarea", placeholder: "{{ $json.text }}" },
  ]),
];

const NODE_TYPES: NodeType[] = [
  {
    type: "manual_trigger", label: "Trigger manually", icon: "MousePointerClick", kind: "trigger", category: "Triggers",
    description: "Runs the flow on clicking a button. Good for getting started quickly.",
    params: [],
  },
  {
    type: "app_event_trigger", label: "On app event", icon: "Boxes", kind: "trigger", category: "Triggers",
    description: "Runs the flow when something happens in an app like Telegram, Notion or Airtable.",
    actionParam: "app",
    params: [
      { key: "app", label: "App", type: "select", options: ["Telegram", "Notion", "Airtable", "Gmail", "Slack", "Google Sheets", "Shopify", "GitHub", "Stripe"], default: "Telegram" },
      { key: "event", label: "Event", type: "text", placeholder: "message.received" },
    ],
  },
  {
    type: "schedule", label: "On a schedule", icon: "Clock", kind: "trigger", category: "Triggers",
    description: "Runs the flow every day, hour, or custom interval.",
    params: [
      { key: "cron", label: "Cron expression", type: "text", placeholder: "0 9 * * 1", default: "0 9 * * *", hint: "min hour day month weekday" },
      { key: "timezone", label: "Timezone", type: "text", placeholder: "UTC", default: "UTC" },
    ],
  },
  {
    type: "webhook", label: "On webhook call", icon: "Webhook", kind: "trigger", category: "Triggers",
    description: "Runs the flow on receiving an HTTP request.",
    params: [
      { key: "path", label: "Path", type: "text", placeholder: "/orders-paid", hint: "Listens at /api/hooks/<path>." },
      { key: "method", label: "HTTP method", type: "select", options: ["GET", "POST", "PUT", "DELETE"], default: "POST" },
    ],
  },
  {
    type: "form_submit", label: "On form submission", icon: "FileInput", kind: "trigger", category: "Triggers",
    description: "Generate webforms and pass their responses to the workflow.",
    params: [{ key: "formId", label: "Form ID", type: "text", placeholder: "contact-form" }],
  },
  {
    type: "workflow_trigger", label: "When executed by another workflow", icon: "Workflow", kind: "trigger", category: "Triggers",
    description: "Runs the flow when called by the Execute Sub-workflow node from a different workflow.",
    params: [],
  },
  {
    type: "chat_trigger", label: "On chat message", icon: "MessageCircle", kind: "trigger", category: "Triggers",
    description: "Runs the flow when a user sends a chat message. For use with AI nodes.",
    params: [
      { key: "initialMessage", label: "Initial message", type: "text", placeholder: "Hi! How can I help?" },
    ],
  },
  {
    type: "eval_trigger", label: "When running evaluation", icon: "ClipboardCheck", kind: "trigger", category: "Triggers",
    description: "Run a dataset through your workflow to test performance.",
    params: [
      { key: "dataset", label: "Dataset", type: "text", placeholder: "test-cases.json" },
    ],
  },

  {
    type: "if", label: "If", icon: "GitBranch", kind: "logic", category: "Flow", subcategory: "Popular",
    description: "Route items to different branches (true/false).",
    outputs: ["true", "false"],
    params: [
      { key: "left", label: "Value", type: "text", placeholder: "{{ $json.email }}" },
      { key: "operator", label: "Operator", type: "select", options: ["equals", "not equals", "contains", "greater than", "less than", "is empty"], default: "equals" },
      { key: "right", label: "Compare to", type: "text", placeholder: "value" },
    ],
  },
  {
    type: "filter", label: "Filter", icon: "Filter", kind: "logic", category: "Flow", subcategory: "Popular",
    description: "Keep only items matching a condition.",
    params: [
      { key: "left", label: "Value", type: "text", placeholder: "{{ $json.status }}" },
      { key: "operator", label: "Operator", type: "select", options: ["equals", "not equals", "contains", "greater than", "less than", "is empty"], default: "equals" },
      { key: "right", label: "Compare to", type: "text", placeholder: "active" },
    ],
  },
  {
    type: "switch", label: "Switch", icon: "Split", kind: "logic", category: "Flow", subcategory: "Other",
    description: "Route items depending on defined expression or rules.",
    outputs: ["0", "1", "2", "3"],
    params: [
      { key: "mode", label: "Mode", type: "select", options: ["Expression"], default: "Expression" },
      { key: "output", label: "Output index", type: "text", placeholder: "={{ $json.priority }}", hint: "0-based index of the output to route each item to (0–3)." },
    ],
  },
  {
    type: "merge", label: "Merge", icon: "GitMerge", kind: "logic", category: "Flow", subcategory: "Popular",
    description: "Merges data of multiple streams once data from both is available.",
    params: [
      { key: "mode", label: "Mode", type: "select", options: ["Append", "Combine", "Choose Branch"], default: "Append" },
    ],
  },
  {
    type: "loop", label: "Loop Over Items (Split in Batches)", icon: "Repeat", kind: "logic", category: "Flow", subcategory: "Popular",
    description: "Split data into batches and iterate over each batch.",
    params: [
      { key: "items", label: "Items", type: "text", placeholder: "{{ $json.items }}" },
      { key: "batchSize", label: "Batch size", type: "number", default: 1 },
    ],
  },
  {
    type: "compare_datasets", label: "Compare Datasets", icon: "GitCompare", kind: "logic", category: "Flow", subcategory: "Other",
    description: "Compare two inputs for changes.",
    params: [
      { key: "mergeByField", label: "Match by field", type: "text", placeholder: "id" },
    ],
  },
  {
    type: "execute_subworkflow", label: "Execute Sub-workflow", icon: "Workflow", kind: "logic", category: "Flow", subcategory: "Other",
    description: "Helpers for calling other workflows. Used for designing modular, microservice-like workflows.",
    params: [
      { key: "workflowId", label: "Workflow", type: "text", placeholder: "wf_..." },
      { key: "mode", label: "Mode", type: "select", options: ["Run once with all items", "Run once for each item"], default: "Run once with all items" },
    ],
  },
  {
    type: "stop_error", label: "Stop and Error", icon: "OctagonX", kind: "logic", category: "Flow", subcategory: "Other",
    description: "Throw an error in the workflow.",
    params: [
      { key: "errorType", label: "Error Type", type: "select", options: ["Error Message", "Error Object"], default: "Error Message" },
      { key: "errorMessage", label: "Error Message", type: "text", default: "An error occurred!", showWhen: { key: "errorType", equals: ["Error Message"] } },
      { key: "errorObject", label: "Error Object (JSON)", type: "textarea", placeholder: "{ \"code\": 500, \"message\": \"…\" }", showWhen: { key: "errorType", equals: ["Error Object"] } },
    ],
  },
  {
    type: "wait", label: "Wait", icon: "Timer", kind: "logic", category: "Flow", subcategory: "Other",
    description: "Wait before continue with execution.",
    params: [
      { key: "amount", label: "Amount", type: "number", default: 5 },
      { key: "unit", label: "Unit", type: "select", options: ["seconds", "minutes", "hours"], default: "seconds" },
    ],
  },

  {
    type: "code", label: "Code", icon: "Code", kind: "logic", category: "Core", subcategory: "Popular",
    description: "Run custom JavaScript or Python code.",
    params: [
      { key: "language", label: "Language", type: "select", options: ["JavaScript", "Python"], default: "JavaScript" },
      { key: "code", label: "Code", type: "textarea", placeholder: "return items;", default: "return items;" },
    ],
  },
  {
    type: "data_table", label: "Data table", icon: "Table2", kind: "action", category: "Core", subcategory: "Popular",
    description: "Permanently save data across workflow executions in a table.",
    actionParam: "operation",
    params: [
      { key: "operation", label: "Operation", type: "select", options: ["Insert row", "Get rows", "Update row", "Delete row"], default: "Insert row" },
      { key: "table", label: "Table", type: "text", placeholder: "my_table" },
    ],
  },
  {
    type: "no_op", label: "No Operation, do nothing", icon: "CircleDashed", kind: "logic", category: "Core", subcategory: "Other",
    description: "No Operation.",
    params: [],
  },
  {
    type: "respond_webhook", label: "Respond to Webhook", icon: "Reply", kind: "action", category: "Core", subcategory: "Other",
    description: "Returns data for Webhook.",
    params: [
      { key: "respondWith", label: "Respond with", type: "select", options: ["First incoming item", "All incoming items", "Text", "JSON", "No data"], default: "First incoming item" },
      { key: "statusCode", label: "Response code", type: "number", default: 200 },
    ],
  },
  {
    type: "execution_data", label: "Execution Data", icon: "Tags", kind: "action", category: "Core", subcategory: "Other",
    description: "Add execution data for search.",
    params: [
      { key: "data", label: "Data to save (JSON)", type: "textarea", placeholder: "{ \"customerId\": \"{{ $json.id }}\" }" },
    ],
  },
  {
    type: "ftp", label: "FTP", icon: "FolderUp", kind: "action", category: "Core", subcategory: "Other",
    description: "Transfer files via FTP or SFTP.",
    actionParam: "operation",
    params: [
      { key: "protocol", label: "Protocol", type: "select", options: ["FTP", "SFTP"], default: "SFTP" },
      { key: "operation", label: "Operation", type: "select", options: ["Download", "Upload", "List", "Delete", "Rename"], default: "Download" },
      { key: "path", label: "Path", type: "text", placeholder: "/uploads/file.csv" },
    ],
  },
  {
    type: "n8n_self", label: "n8n", icon: "Workflow", kind: "action", category: "Core", subcategory: "Other",
    description: "Handle events and perform actions on your instance.",
    actionParam: "operation",
    params: [
      { key: "operation", label: "Operation", type: "select", options: ["Get workflows", "Get executions", "Activate workflow", "Deactivate workflow"], default: "Get workflows" },
    ],
  },
  {
    type: "n8n_form", label: "n8n Form", icon: "FileInput", kind: "action", category: "Core", subcategory: "Other",
    description: "Generate webforms and pass their responses to the workflow.",
    params: [
      { key: "title", label: "Form title", type: "text", placeholder: "Contact us" },
      { key: "fields", label: "Form fields (JSON)", type: "textarea", placeholder: "[{ \"label\": \"Email\", \"type\": \"email\" }]" },
    ],
  },
  {
    type: "track_time_saved", label: "Track Time Saved", icon: "Timer", kind: "action", category: "Core", subcategory: "Other",
    description: "Dynamically track time saved based on the workflow's execution path and the number of items processed.",
    params: [
      { key: "minutesPerItem", label: "Minutes saved per item", type: "number", default: 1 },
    ],
  },

  {
    type: "db_write", label: "Database", icon: "Database", kind: "action", category: "Actions",
    description: "Create or update a record.",
    params: [
      { key: "table", label: "Table", type: "text", placeholder: "orders" },
      { key: "operation", label: "Operation", type: "select", options: ["insert", "update", "upsert"], default: "insert" },
      { key: "matchField", label: "Match on field", type: "text", placeholder: "id", hint: "Existing rows are matched on this field.", showWhen: { key: "operation", equals: ["update", "upsert"] } },
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
    type: "http", label: "HTTP Request", icon: "Globe", kind: "action", category: "Core", subcategory: "Popular",
    description: "Makes an HTTP request and returns the response data.",
    params: [
      { key: "method", label: "Method", type: "select", options: ["GET", "POST", "PUT", "PATCH", "DELETE"], default: "GET" },
      { key: "url", label: "URL", type: "text", placeholder: "https://api.example.com/v1/…" },
      { key: "authentication", label: "Authentication", type: "select", options: ["None", "Header Auth"], default: "None" },
      { key: "credential", label: "Credential", type: "credential", credentialType: "http_header", showWhen: { key: "authentication", equals: ["Header Auth"] } },
      { key: "body", label: "Body (JSON)", type: "textarea", placeholder: "{ \"key\": \"value\" }", showWhen: { key: "method", equals: ["POST", "PUT", "PATCH"] } },
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
    description: "Charge, refund or sync a Stripe customer.", actionParam: "action",
    params: [
      { key: "action", label: "Action", type: "select", options: ["charge", "refund", "sync customer"], default: "charge" },
      { key: "amount", label: "Amount (cents)", type: "number", placeholder: "1999" },
    ],
  },
  {
    type: "slack", label: "Slack", icon: "Hash", kind: "integration", category: "Integrations",
    description: "Post a message, upload a file or manage a Slack channel.", actionParam: "operation",
    params: [
      { key: "operation", label: "Operation", type: "select", options: ["Send message", "Update message", "Upload file", "Create channel", "Get channel history"], default: "Send message" },
      { key: "channel", label: "Channel", type: "text", placeholder: "#sales", default: "#general" },
      { key: "message", label: "Message", type: "textarea", placeholder: "New lead: {{ $json.name }}" },
    ],
  },

  // ── Action in an app — popular integrations. Each exposes an "operation"
  //    select (its actions), surfaced as the third level of the add-node panel.
  ...APP_INTEGRATIONS,

  // ── Data transformation ─────────────────────────────────────────────────
  ...DATA_TRANSFORM_NODES,

  // ── Human review ──────────────────────────────────────────────────────────
  {
    type: "human_review", label: "Send and wait for response", icon: "UserCheck", kind: "action", category: "Human review",
    description: "Request approval via chat or email and wait for the response before continuing.", actionParam: "channel",
    params: [
      { key: "channel", label: "Send via", type: "select", options: ["Chat", "Discord", "Gmail", "Google Chat", "Microsoft Outlook", "Microsoft Teams", "Send Email", "Slack", "Telegram", "WhatsApp Business Cloud"], default: "Slack" },
      { key: "to", label: "Send to", type: "text", placeholder: "#approvals / chat id / email" },
      { key: "message", label: "Message", type: "textarea", placeholder: "Approve this action? {{ $json.summary }}" },
      { key: "timeout", label: "Timeout (minutes)", type: "number", default: 60 },
    ],
  },

  {
    type: "ai_agent", label: "AI Agent", icon: "Sparkles", kind: "action", category: "AI", subcategory: "Agents",
    description: "Generates an action plan and executes it. Can use external tools.",
    params: [
      { key: "prompt", label: "Prompt", type: "textarea", placeholder: "Summarize this: {{ $json.text }}" },
      { key: "model", label: "Model", type: "select", options: ["claude-opus-4-8", "claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"], default: "claude-opus-4-8" },
      { key: "system", label: "System prompt", type: "textarea", placeholder: "You are a helpful assistant." },
      { key: "credential", label: "Anthropic credential", type: "credential", credentialType: "anthropic", hint: "Optional — overrides ANTHROPIC_API_KEY." },
    ],
  },

  // ── AI root nodes — provider apps, chains and misc (the "AI Nodes" panel). ──
  ...AI_ROOT_NODES,

  // ── AI sub-nodes — Chat Models / Memory / Tools (attach to an AI Agent via
  //    its Chat Model / Memory / Tool ports). Full catalog in lib/ai-catalog.ts.
  ...AI_SUB_NODE_TYPES,

  // ── Sticky note — a canvas annotation, not a flow node (never executes). ──
  {
    type: "sticky_note", label: "Sticky Note", icon: "StickyNote", kind: "note", category: "Notes",
    description: "Add a note to the canvas. Double-click to edit.",
    params: [
      { key: "content", label: "Content", type: "textarea", default: "I'm a note\n\nDouble click to edit me." },
      { key: "color", label: "Color", type: "select", options: ["yellow", "blue", "green", "red", "purple", "gray"], default: "yellow" },
    ],
  },
];

export const SEED_WORKFLOWS: Workflow[] = [
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

  // ── Product example workflows (templates) ──────────────────────────────────
  {
    id: "wf_get_products",
    name: "Get Products (scheduled)",
    status: "draft",
    lastRun: null,
    runs: 0,
    nodes: [
      { id: "gp1", type: "schedule", name: "Daily 9am", x: 40, y: 160, config: { cron: "0 9 * * *", timezone: "UTC" } },
      { id: "gp2", type: "http", name: "Fetch products", x: 300, y: 160, config: { method: "GET", url: "https://dummyjson.com/products?limit=10" } },
      { id: "gp3", type: "code", name: "Extract titles", x: 560, y: 160, config: { code: "return (items[0].body.products || []).map(p => ({ id: p.id, title: p.title, price: p.price }));" } },
    ],
    connections: [
      { id: "gpc1", from: "gp1", to: "gp2" },
      { id: "gpc2", from: "gp2", to: "gp3" },
    ],
  },
  {
    id: "wf_list_products",
    name: "List Products → Slack",
    status: "active",
    lastRun: null,
    runs: 0,
    nodes: [
      { id: "lp1", type: "webhook", name: "On request", x: 40, y: 160, config: { path: "list-products", method: "GET" } },
      { id: "lp2", type: "http", name: "Get products", x: 300, y: 160, config: { method: "GET", url: "https://dummyjson.com/products?limit=5" } },
      { id: "lp3", type: "code", name: "Format", x: 560, y: 160, config: { code: "return (items[0].body.products || []).map(p => ({ name: p.title, price: p.price }));" } },
      { id: "lp4", type: "slack", name: "Post to #catalog", x: 820, y: 160, config: { channel: "#catalog", message: "{{ $json.name }} — ${{ $json.price }}" } },
    ],
    connections: [
      { id: "lpc1", from: "lp1", to: "lp2" },
      { id: "lpc2", from: "lp2", to: "lp3" },
      { id: "lpc3", from: "lp3", to: "lp4" },
    ],
  },
  {
    id: "wf_create_product",
    name: "Create Product",
    status: "draft",
    lastRun: null,
    runs: 0,
    nodes: [
      { id: "cp1", type: "webhook", name: "New product", x: 40, y: 180, config: { path: "create-product", method: "POST" } },
      { id: "cp2", type: "if", name: "Missing name?", x: 300, y: 180, config: { left: "{{ $json.body.name }}", operator: "is empty", right: "" } },
      { id: "cp3", type: "slack", name: "Reject", x: 560, y: 80, config: { channel: "#errors", message: "Product create rejected: no name" } },
      { id: "cp4", type: "db_write", name: "Save product", x: 560, y: 280, config: { table: "products", operation: "insert" } },
      { id: "cp5", type: "crm_lead", name: "Notify owner", x: 820, y: 280, config: { name: "{{ $json.body.name }}", email: "owner@shop.com", source: "product" } },
    ],
    connections: [
      { id: "cpc1", from: "cp1", to: "cp2" },
      { id: "cpc2", from: "cp2", to: "cp3", fromPort: "true" },
      { id: "cpc3", from: "cp2", to: "cp4", fromPort: "false" },
      { id: "cpc4", from: "cp4", to: "cp5" },
    ],
  },
];

// Map a DB row to the domain Workflow shape (drops audit columns).
type WfRow = typeof wfTable.$inferSelect;
function rowToWorkflow(r: WfRow): Workflow {
  return {
    id: r.id,
    name: r.name,
    status: r.status as WorkflowStatus,
    nodes: r.nodes ?? [],
    connections: r.connections ?? [],
    lastRun: r.lastRun ? new Date(r.lastRun).toISOString() : null,
    runs: r.runs,
  };
}

const newId = () => "wf_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Postgres-backed workflows repository (Drizzle). nodeTypes()/presets() remain
// static in-process catalogs; only user data hits the database.
export class WorkflowsRepository {
  nodeTypes(): NodeType[] {
    return NODE_TYPES;
  }

  presets(): WorkflowPreset[] {
    return WORKFLOW_PRESETS;
  }

  // Global list — used by the scheduler and webhook matcher (cross-space).
  async findAll(): Promise<Workflow[]> {
    const db = await getDb();
    const rows = await db.select().from(wfTable).orderBy(desc(wfTable.createdAt));
    return rows.map(rowToWorkflow);
  }

  // Space-scoped list — used by the builder UI.
  async findAllForSpace(spaceId: string): Promise<Workflow[]> {
    const db = await getDb();
    const rows = await db.select().from(wfTable).where(eq(wfTable.spaceId, spaceId)).orderBy(desc(wfTable.createdAt));
    return rows.map(rowToWorkflow);
  }

  async findById(id: string): Promise<Workflow | undefined> {
    const db = await getDb();
    const rows = await db.select().from(wfTable).where(eq(wfTable.id, id)).limit(1);
    return rows[0] ? rowToWorkflow(rows[0]) : undefined;
  }

  async create(input: CreateWorkflowInput, owner?: WorkflowOwner): Promise<Workflow> {
    const db = await getDb();
    const [row] = await db
      .insert(wfTable)
      .values({
        id: newId(),
        name: input.name,
        status: "draft",
        nodes: input.nodes ?? [],
        connections: input.connections ?? [],
        spaceId: owner?.spaceId ?? null,
        ownerId: owner?.ownerId ?? null,
      })
      .returning();
    return rowToWorkflow(row);
  }

  // Instantiate a preset as a new draft workflow (deep-copied).
  async createFromPreset(presetId: string, name?: string, owner?: WorkflowOwner): Promise<Workflow | undefined> {
    const preset = WORKFLOW_PRESETS.find((p) => p.id === presetId);
    if (!preset) return undefined;
    const db = await getDb();
    const [row] = await db
      .insert(wfTable)
      .values({
        id: newId(),
        name: name?.trim() || preset.name,
        status: "draft",
        nodes: structuredClone(preset.nodes),
        connections: structuredClone(preset.connections),
        spaceId: owner?.spaceId ?? null,
        ownerId: owner?.ownerId ?? null,
      })
      .returning();
    return rowToWorkflow(row);
  }

  async update(id: string, patch: UpdateWorkflowInput): Promise<Workflow | undefined> {
    const db = await getDb();
    const set: Partial<WfRow> = { updatedAt: new Date().toISOString() };
    if (patch.name !== undefined) set.name = patch.name;
    if (patch.status !== undefined) set.status = patch.status;
    if (patch.nodes !== undefined) set.nodes = patch.nodes;
    if (patch.connections !== undefined) set.connections = patch.connections;
    const [row] = await db.update(wfTable).set(set).where(eq(wfTable.id, id)).returning();
    return row ? rowToWorkflow(row) : undefined;
  }

  async remove(id: string): Promise<Workflow | undefined> {
    const db = await getDb();
    const [row] = await db.delete(wfTable).where(eq(wfTable.id, id)).returning();
    return row ? rowToWorkflow(row) : undefined;
  }

  // Reflect a completed run on the workflow record (run count + last run time).
  async bumpStats(id: string, finishedAt: string): Promise<void> {
    const db = await getDb();
    await db
      .update(wfTable)
      .set({ runs: sql`${wfTable.runs} + 1`, lastRun: finishedAt })
      .where(eq(wfTable.id, id));
  }
}

export const workflowsRepository = new WorkflowsRepository();
