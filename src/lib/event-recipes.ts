import type { ActionTypeDef, EventAction, EventHandler, EventTrigger } from "./events";

export interface RecipeConfigEntry { key: string; value: string; }
export interface RecipeAction { type: string; config: RecipeConfigEntry[]; }
export interface EventRecipe {
  id: string;
  label: string;
  category: string;
  icon: string;
  description: string;
  trigger: EventTrigger;
  actions: RecipeAction[];
}

// Synthesized + deduped action taxonomy from all interaction families.
export const ACTION_TYPES: ActionTypeDef[] = [
  {
    type: "navigate",
    label: "Go to page",
    description: "Client-side route to an internal page in the same project (no full reload).",
    icon: "ArrowRight",
    configFields: [
      { key: "route", label: "Target page", type: "ref", required: true, refKind: "page" },
      { key: "query", label: "Query params", type: "map" },
      { key: "preserveScroll", label: "Preserve scroll position", type: "boolean" },
      { key: "replace", label: "Replace history (no Back entry)", type: "boolean" },
    ],
  },
  {
    type: "open_url",
    label: "Open external URL",
    description: "Open an external web address, optionally in a new browser tab.",
    icon: "ExternalLink",
    configFields: [
      { key: "url", label: "URL", type: "string", required: true },
      { key: "target", label: "Open in", type: "enum", values: ["_blank", "_self"], required: true },
      { key: "rel", label: "Link rel", type: "enum", values: ["noopener noreferrer", "nofollow", "none"] },
    ],
  },
  {
    type: "scroll_to",
    label: "Scroll to section",
    description: "Smooth-scroll to a target block or anchor on the current page.",
    icon: "MousePointerClick",
    configFields: [
      { key: "target", label: "Target block / anchor", type: "ref", required: true, refKind: "block" },
      { key: "behavior", label: "Scroll behavior", type: "enum", values: ["smooth", "auto"] },
      { key: "align", label: "Align to", type: "enum", values: ["start", "center", "end", "nearest"] },
      { key: "offset", label: "Pixel offset (sticky header)", type: "number" },
    ],
  },
  {
    type: "go_back",
    label: "Go back",
    description: "Navigate to the previous entry in browser history; falls back to a route if there is none.",
    icon: "ArrowLeft",
    configFields: [
      { key: "fallbackRoute", label: "Fallback page (no history)", type: "ref", refKind: "page" },
    ],
  },
  {
    type: "redirect_after",
    label: "Redirect after action",
    description: "Redirect to a page once a bound action (form/API/workflow) resolves, optionally after a delay.",
    icon: "CornerDownRight",
    configFields: [
      { key: "route", label: "Target page", type: "ref", required: true, refKind: "page" },
      { key: "delayMs", label: "Delay before redirect (ms)", type: "number" },
      { key: "query", label: "Query params", type: "map" },
      { key: "replace", label: "Replace history (no Back entry)", type: "boolean" },
    ],
  },
  {
    type: "scroll_to_top",
    label: "Scroll to top",
    description: "Smooth-scroll the page back to the very top.",
    icon: "ArrowUpToLine",
    configFields: [
      { key: "behavior", label: "Scroll behavior", type: "enum", values: ["smooth", "auto"] },
    ],
  },
  {
    type: "paginate",
    label: "Paginate list",
    description: "Move a bound list/grid to the next, previous, or a specific page of results.",
    icon: "ChevronsRight",
    configFields: [
      { key: "target", label: "List block", type: "ref", required: true, refKind: "block" },
      { key: "direction", label: "Direction", type: "enum", values: ["next", "prev", "first", "last", "goto"], required: true },
      { key: "page", label: "Page number (for goto)", type: "number" },
      { key: "syncQueryParam", label: "Sync to ?page= in URL", type: "boolean" },
    ],
  },
  {
    type: "set_query_param",
    label: "Set URL parameter",
    description: "Write or update a query-string parameter on the current URL without leaving the page.",
    icon: "Link2",
    configFields: [
      { key: "params", label: "Params to set", type: "map", required: true },
      { key: "replace", label: "Replace history (no Back entry)", type: "boolean" },
    ],
  },
  {
    type: "switch_tab",
    label: "Switch in-page tab/step",
    description: "Activate a tab, accordion panel, or wizard step inside a tabbed/stepper block.",
    icon: "PanelTop",
    configFields: [
      { key: "target", label: "Tab / stepper block", type: "ref", required: true, refKind: "block" },
      { key: "tab", label: "Panel / step key", type: "string", required: true },
    ],
  },
  {
    type: "submit_form",
    label: "Submit Form",
    description: "Collect and validate all fields of a form block, then hand the payload to downstream actions.",
    icon: "SendHorizontal",
    configFields: [
      { key: "formId", label: "Form", type: "ref", required: true, refKind: "form" },
      { key: "validate", label: "Validate before submit", type: "boolean" },
      { key: "preventDefault", label: "Prevent native submit", type: "boolean" },
    ],
  },
  {
    type: "validate_field",
    label: "Validate Field",
    description: "Run validation on a single input as the user types or blurs, surfacing inline pass/fail feedback.",
    icon: "CheckCheck",
    configFields: [
      { key: "field", label: "Field name", type: "string", required: true },
      { key: "rule", label: "Rule", type: "enum", values: ["required", "email", "phone", "url", "number", "min_length", "max_length", "pattern", "match_field"], required: true },
      { key: "ruleValue", label: "Rule value (length / regex / field)", type: "string" },
      { key: "errorMessage", label: "Error message", type: "string" },
    ],
  },
  {
    type: "create_lead",
    label: "Create CRM Lead",
    description: "Map form fields onto a CRM lead/contact record and create it in the connected CRM.",
    icon: "UserPlus",
    configFields: [
      { key: "crm", label: "CRM connection", type: "ref", required: true, refKind: "crm" },
      { key: "fieldMap", label: "Field mapping (lead field â†’ form field)", type: "map", required: true },
      { key: "source", label: "Lead source", type: "string" },
      { key: "tags", label: "Tags", type: "string" },
      { key: "owner", label: "Assign to owner", type: "string" },
    ],
  },
  {
    type: "save_record",
    label: "Save Record to Table",
    description: "Insert or upsert the submission as a row in a database/collection table.",
    icon: "Database",
    configFields: [
      { key: "table", label: "Table / collection", type: "ref", required: true, refKind: "endpoint" },
      { key: "fieldMap", label: "Column mapping (column â†’ form field)", type: "map", required: true },
      { key: "mode", label: "Mode", type: "enum", values: ["insert", "upsert", "update"] },
      { key: "upsertKey", label: "Upsert match column", type: "string" },
    ],
  },
  {
    type: "send_email",
    label: "Send Email",
    description: "Send a transactional confirmation/notification email using a template and recipient.",
    icon: "Mail",
    configFields: [
      { key: "template", label: "Email template", type: "ref", required: true, refKind: "asset" },
      { key: "to", label: "Recipient (field or address)", type: "string", required: true },
      { key: "from", label: "From / sender", type: "string" },
      { key: "replyTo", label: "Reply-to", type: "string" },
      { key: "vars", label: "Template variables", type: "map" },
    ],
  },
  {
    type: "run_workflow",
    label: "Run Workflow",
    description: "Hand the validated submission to a backend workflow for routing, enrichment, or fan-out.",
    icon: "Workflow",
    configFields: [
      { key: "workflowId", label: "Workflow", type: "ref", required: true, refKind: "workflow" },
      { key: "inputMap", label: "Input mapping (workflow input â†’ form field)", type: "map" },
      { key: "input", label: "Input Field Map", type: "map" },
      { key: "runMode", label: "Run Mode", type: "enum", values: ["async", "await"] },
    ],
  },
  {
    type: "call_api",
    label: "Call API Endpoint",
    description: "POST the submission to a configured external/internal endpoint profile.",
    icon: "Webhook",
    configFields: [
      { key: "endpointId", label: "Endpoint", type: "ref", required: true, refKind: "endpoint" },
      { key: "bodyMap", label: "Body field mapping", type: "map" },
      { key: "body", label: "Body Field Map", type: "map" },
      { key: "queryMap", label: "Query Params (key â†’ value)", type: "map" },
      { key: "headerMap", label: "Headers (key â†’ value)", type: "map" },
      { key: "resultVar", label: "Save Response As Variable", type: "string" },
    ],
  },
  {
    type: "book_appointment",
    label: "Request Appointment",
    description: "Create a booking/appointment request for a chosen slot, optionally holding the slot.",
    icon: "CalendarCheck",
    configFields: [
      { key: "calendar", label: "Calendar / resource", type: "ref", required: true, refKind: "endpoint" },
      { key: "slotField", label: "Slot field", type: "string", required: true },
      { key: "durationField", label: "Duration field", type: "string" },
      { key: "attendeeMap", label: "Attendee field mapping", type: "map" },
      { key: "status", label: "Initial status", type: "enum", values: ["requested", "pending", "confirmed"] },
    ],
  },
  {
    type: "goto_step",
    label: "Go To Form Step",
    description: "Advance, rewind, or jump to a step in a multi-step form, validating the current step first.",
    icon: "ListChecks",
    configFields: [
      { key: "formId", label: "Form", type: "ref", required: true, refKind: "form" },
      { key: "direction", label: "Direction", type: "enum", values: ["next", "previous", "goto"], required: true },
      { key: "step", label: "Target step (for goto)", type: "number" },
      { key: "validateCurrent", label: "Validate current step", type: "boolean" },
    ],
  },
  {
    type: "reset_form",
    label: "Reset Form",
    description: "Clear field values and validation state of a form, optionally keeping certain fields.",
    icon: "Eraser",
    configFields: [
      { key: "formId", label: "Form", type: "ref", required: true, refKind: "form" },
      { key: "keepFields", label: "Fields to keep", type: "string" },
    ],
  },
  {
    type: "inline_message",
    label: "Inline Message",
    description: "Show a success/error message inside the form block without navigating away.",
    icon: "MessageSquareText",
    configFields: [
      { key: "target", label: "Target block", type: "ref", refKind: "block" },
      { key: "message", label: "Message", type: "richtext", required: true },
      { key: "tone", label: "Tone", type: "enum", values: ["success", "info", "warning", "error"] },
    ],
  },
  {
    type: "show_toast",
    label: "Show Toast",
    description: "Pop a transient toast notification confirming the submission outcome.",
    icon: "Bell",
    configFields: [
      { key: "message", label: "Message", type: "string", required: true },
      { key: "tone", label: "Tone", type: "enum", values: ["success", "info", "warning", "error"] },
      { key: "duration", label: "Auto-dismiss (ms)", type: "number" },
    ],
  },
  {
    type: "set_variable",
    label: "Set Variable",
    description: "Store a value (e.g. submission id, lead score, step state) for later use on the page.",
    icon: "Variable",
    configFields: [
      { key: "name", label: "Variable name", type: "string", required: true },
      { key: "value", label: "Value", type: "string", required: true },
    ],
  },
  {
    type: "track_event",
    label: "Track Event",
    description: "Emit an analytics event for the submission/conversion with custom properties.",
    icon: "LineChart",
    configFields: [
      { key: "event", label: "Event name", type: "string", required: true },
      { key: "props", label: "Properties", type: "map" },
      { key: "destinations", label: "Send To", type: "enum", values: ["all", "ga4", "gtm", "segment", "meta_pixel", "internal"] },
    ],
  },
  {
    type: "show_block",
    label: "Show Block",
    description: "Reveal a hidden block such as a conditional follow-up question or success panel.",
    icon: "Eye",
    configFields: [
      { key: "target", label: "Target block", type: "ref", required: true, refKind: "block" },
      { key: "animation", label: "Animation", type: "enum", values: ["none", "fade", "slide-up", "slide-down", "zoom"] },
    ],
  },
  {
    type: "hide_block",
    label: "Hide Block",
    description: "Hide a block such as the form itself once it has been submitted.",
    icon: "EyeOff",
    configFields: [
      { key: "target", label: "Target block", type: "ref", required: true, refKind: "block" },
      { key: "animation", label: "Animation", type: "enum", values: ["none", "fade", "slide-up", "slide-down", "zoom"] },
    ],
  },
  {
    type: "add_to_cart",
    label: "Add to Cart",
    description: "Add a product (and optional variant/qty) to the shopping cart.",
    icon: "ShoppingCart",
    configFields: [
      { key: "productId", label: "Product", type: "ref", required: true, refKind: "product" },
      { key: "variantId", label: "Variant", type: "string" },
      { key: "qty", label: "Quantity", type: "number" },
    ],
  },
  {
    type: "remove_from_cart",
    label: "Remove from Cart",
    description: "Remove a line item from the cart.",
    icon: "Trash2",
    configFields: [
      { key: "productId", label: "Product", type: "ref", required: true, refKind: "product" },
      { key: "variantId", label: "Variant", type: "string" },
    ],
  },
  {
    type: "update_cart_qty",
    label: "Update Quantity",
    description: "Set or change the quantity of a cart line item.",
    icon: "Plus",
    configFields: [
      { key: "productId", label: "Product", type: "ref", required: true, refKind: "product" },
      { key: "variantId", label: "Variant", type: "string" },
      { key: "qty", label: "Quantity", type: "number", required: true },
      { key: "mode", label: "Mode", type: "enum", values: ["set", "increment", "decrement"], required: true },
    ],
  },
  {
    type: "apply_coupon",
    label: "Apply Coupon",
    description: "Apply a discount/promo code to the cart.",
    icon: "Ticket",
    configFields: [
      { key: "code", label: "Coupon Code", type: "string", required: true },
    ],
  },
  {
    type: "remove_coupon",
    label: "Remove Coupon",
    description: "Remove an applied discount code from the cart.",
    icon: "TicketX",
    configFields: [
      { key: "code", label: "Coupon Code", type: "string" },
    ],
  },
  {
    type: "checkout",
    label: "Go to Checkout",
    description: "Start the checkout flow for the current cart.",
    icon: "CreditCard",
    configFields: [
      { key: "checkoutMode", label: "Checkout Mode", type: "enum", values: ["hosted", "express", "inline"] },
      { key: "successUrl", label: "On-Success Route", type: "string" },
    ],
  },
  {
    type: "add_to_wishlist",
    label: "Add to Wishlist",
    description: "Save a product to the shopper's wishlist/favorites.",
    icon: "Heart",
    configFields: [
      { key: "productId", label: "Product", type: "ref", required: true, refKind: "product" },
      { key: "variantId", label: "Variant", type: "string" },
    ],
  },
  {
    type: "remove_from_wishlist",
    label: "Remove from Wishlist",
    description: "Remove a product from the wishlist/favorites.",
    icon: "HeartOff",
    configFields: [
      { key: "productId", label: "Product", type: "ref", required: true, refKind: "product" },
    ],
  },
  {
    type: "quick_view",
    label: "Quick-View Product",
    description: "Open a product preview modal without leaving the page.",
    icon: "Eye",
    configFields: [
      { key: "productId", label: "Product", type: "ref", required: true, refKind: "product" },
      { key: "target", label: "Modal Target", type: "ref", required: true, refKind: "block" },
    ],
  },
  {
    type: "notify_in_stock",
    label: "Notify When in Stock",
    description: "Register the shopper's email for a back-in-stock alert on a product.",
    icon: "BellRing",
    configFields: [
      { key: "productId", label: "Product", type: "ref", required: true, refKind: "product" },
      { key: "variantId", label: "Variant", type: "string" },
      { key: "email", label: "Email Field", type: "string", required: true },
    ],
  },
  {
    type: "open_cart_drawer",
    label: "Open Cart Drawer",
    description: "Slide open the mini-cart drawer to review items.",
    icon: "PanelRightOpen",
    configFields: [
      { key: "target", label: "Drawer Target", type: "ref", required: true, refKind: "block" },
    ],
  },
  {
    type: "open_modal",
    label: "Open Modal",
    description: "Open a modal/dialog block by reference.",
    icon: "SquareStack",
    configFields: [
      { key: "target", label: "Modal Target", type: "ref", required: true, refKind: "block" },
      { key: "backdrop", label: "Backdrop dismiss", type: "boolean" },
    ],
  },
  {
    type: "close_modal",
    label: "Close Modal",
    description: "Close an open modal/dialog block.",
    icon: "X",
    configFields: [
      { key: "target", label: "Modal Target", type: "ref", required: true, refKind: "block" },
    ],
  },
  {
    type: "share",
    label: "Share",
    description: "Share a product link via a network or native share sheet.",
    icon: "Share2",
    configFields: [
      { key: "network", label: "Network", type: "enum", values: ["native", "copy", "whatsapp", "facebook", "x", "email"], required: true },
      { key: "value", label: "URL/Value", type: "string" },
      { key: "url", label: "URL to share", type: "string", required: true },
      { key: "text", label: "Share text / caption", type: "string" },
      { key: "hashtags", label: "Hashtags (comma separated)", type: "string" },
      { key: "via", label: "Via handle (X)", type: "string" },
    ],
  },
  {
    type: "ai_generate",
    label: "AI Generate Content",
    description: "Runs a prompt through the AI engine and writes the generated output into a target block or variable.",
    icon: "Sparkles",
    configFields: [
      { key: "prompt", label: "Prompt", type: "richtext", required: true },
      { key: "model", label: "Model", type: "enum", values: ["fast", "balanced", "quality"] },
      { key: "target", label: "Write Output To Block", type: "ref", refKind: "block" },
      { key: "outputVar", label: "Save Output As Variable", type: "string" },
      { key: "stream", label: "Stream Output", type: "boolean" },
    ],
  },
  {
    type: "ai_summarize",
    label: "AI Summarize",
    description: "Condenses source text (a block, field, or variable) into a short summary and writes it to a target.",
    icon: "TextQuote",
    configFields: [
      { key: "source", label: "Source (block/field/variable)", type: "string", required: true },
      { key: "length", label: "Summary Length", type: "enum", values: ["one_line", "short", "bullets", "paragraph"] },
      { key: "target", label: "Write Summary To Block", type: "ref", refKind: "block" },
      { key: "outputVar", label: "Save Summary As Variable", type: "string" },
    ],
  },
  {
    type: "ai_translate",
    label: "AI Translate",
    description: "Translates source text into a chosen target language and writes it back to a block or variable.",
    icon: "Languages",
    configFields: [
      { key: "source", label: "Source (block/field/variable)", type: "string", required: true },
      { key: "targetLanguage", label: "Target Language", type: "string", required: true },
      { key: "target", label: "Write Translation To Block", type: "ref", refKind: "block" },
      { key: "outputVar", label: "Save Translation As Variable", type: "string" },
    ],
  },
  {
    type: "reload_block",
    label: "Refresh Block",
    description: "Re-fetches and re-renders a data-bound block to reflect the latest results.",
    icon: "RefreshCw",
    configFields: [
      { key: "target", label: "Target Block", type: "ref", required: true, refKind: "block" },
    ],
  },
  {
    type: "ai_classify",
    label: "AI Classify / Route",
    description: "Classifies input text into one of a defined set of labels and saves the chosen label as a variable for branching/routing.",
    icon: "Tags",
    configFields: [
      { key: "source", label: "Source (block/field/variable)", type: "string", required: true },
      { key: "labels", label: "Allowed Labels", type: "string", required: true },
      { key: "outputVar", label: "Save Label As Variable", type: "string", required: true },
    ],
  },
  {
    type: "open_drawer",
    label: "Open Drawer",
    description: "Slide in a side/bottom drawer panel.",
    icon: "PanelRightOpen",
    configFields: [
      { key: "target", label: "Drawer", type: "ref", required: true, refKind: "block" },
      { key: "side", label: "Side", type: "enum", values: ["left", "right", "top", "bottom"] },
    ],
  },
  {
    type: "close_drawer",
    label: "Close Drawer",
    description: "Dismiss an open drawer panel.",
    icon: "PanelRightClose",
    configFields: [
      { key: "target", label: "Drawer", type: "ref", required: true, refKind: "block" },
    ],
  },
  {
    type: "toggle_block",
    label: "Toggle Block",
    description: "Show a block if hidden, hide it if visible (accordion/expander).",
    icon: "ChevronsUpDown",
    configFields: [
      { key: "target", label: "Block", type: "ref", required: true, refKind: "block" },
      { key: "animation", label: "Animation", type: "enum", values: ["none", "collapse", "fade", "slide"] },
    ],
  },
  {
    type: "select_tab",
    label: "Switch Tab",
    description: "Activate a specific tab inside a tabs/segmented block.",
    icon: "LayoutPanelTop",
    configFields: [
      { key: "target", label: "Tabs group", type: "ref", required: true, refKind: "block" },
      { key: "tabId", label: "Tab", type: "string", required: true },
    ],
  },
  {
    type: "copy_clipboard",
    label: "Copy to Clipboard",
    description: "Copy a value (code, link, text) to the user clipboard.",
    icon: "Copy",
    configFields: [
      { key: "value", label: "Value", type: "string", required: true },
    ],
  },
  {
    type: "toggle_theme",
    label: "Toggle Theme",
    description: "Switch between light and dark theme (or force a mode).",
    icon: "MoonStar",
    configFields: [
      { key: "mode", label: "Mode", type: "enum", values: ["toggle", "light", "dark", "system"] },
    ],
  },
  {
    type: "toggle_tooltip",
    label: "Toggle Tooltip/Popover",
    description: "Open or toggle a tooltip/popover anchored to an element.",
    icon: "MessageCircleQuestion",
    configFields: [
      { key: "target", label: "Popover", type: "ref", required: true, refKind: "block" },
      { key: "placement", label: "Placement", type: "enum", values: ["top", "bottom", "left", "right"] },
    ],
  },
  {
    type: "animate_block",
    label: "Animate Block",
    description: "Play an entrance/attention animation on a block (used for reveal-on-view).",
    icon: "Sparkles",
    configFields: [
      { key: "target", label: "Block", type: "ref", required: true, refKind: "block" },
      { key: "effect", label: "Effect", type: "enum", values: ["fade-up", "fade-in", "slide-left", "slide-right", "zoom-in", "blur-in"], required: true },
      { key: "duration", label: "Duration (ms)", type: "number" },
      { key: "delay", label: "Delay (ms)", type: "number" },
    ],
  },
  {
    type: "track_pageview",
    label: "Fire Pageview",
    description: "Record a pageview/screen-view hit, including virtual pageviews for SPA route changes.",
    icon: "FileText",
    configFields: [
      { key: "path", label: "Page Path", type: "string" },
      { key: "title", label: "Page Title", type: "string" },
      { key: "referrer", label: "Referrer", type: "string" },
      { key: "destinations", label: "Send To", type: "enum", values: ["all", "ga4", "gtm", "segment", "meta_pixel"] },
    ],
  },
  {
    type: "track_conversion",
    label: "Track Conversion",
    description: "Fire a conversion/goal event (e.g. purchase, signup, lead) with value and currency for ad attribution.",
    icon: "Target",
    configFields: [
      { key: "conversionId", label: "Conversion / Goal", type: "string", required: true },
      { key: "value", label: "Value", type: "number" },
      { key: "currency", label: "Currency", type: "enum", values: ["USD", "EUR", "GBP", "INR", "AUD", "CAD"] },
      { key: "transactionId", label: "Transaction / Order ID", type: "string" },
      { key: "destinations", label: "Send To", type: "enum", values: ["all", "ga4", "google_ads", "meta_pixel", "gtm"] },
    ],
  },
  {
    type: "identify_user",
    label: "Identify User",
    description: "Associate the current visitor with a stable user id and profile traits across analytics tools.",
    icon: "UserCheck",
    configFields: [
      { key: "userId", label: "User ID", type: "string", required: true },
      { key: "traits", label: "User Traits", type: "map" },
      { key: "destinations", label: "Send To", type: "enum", values: ["all", "segment", "ga4", "internal"] },
    ],
  },
  {
    type: "push_datalayer",
    label: "Push to dataLayer",
    description: "Push a raw event object onto the GTM dataLayer so Tag Manager triggers and tags can fire.",
    icon: "Layers",
    configFields: [
      { key: "event", label: "dataLayer event", type: "string", required: true },
      { key: "payload", label: "Payload", type: "map" },
    ],
  },
  {
    type: "track_outbound",
    label: "Track Outbound Link",
    description: "Record a click on a link leaving the site (with the destination URL) before navigation continues.",
    icon: "ExternalLink",
    configFields: [
      { key: "url", label: "Destination URL", type: "string", required: true },
      { key: "linkText", label: "Link Label", type: "string" },
      { key: "destinations", label: "Send To", type: "enum", values: ["all", "ga4", "gtm", "segment"] },
    ],
  },
  {
    type: "track_scroll_depth",
    label: "Track Scroll Depth",
    description: "Emit a scroll-depth milestone event when the block enters the viewport at a given threshold.",
    icon: "MoveVertical",
    configFields: [
      { key: "threshold", label: "Depth Reached", type: "enum", values: ["25%", "50%", "75%", "90%", "100%", "section_seen"], required: true },
      { key: "label", label: "Section Label", type: "string" },
      { key: "destinations", label: "Send To", type: "enum", values: ["all", "ga4", "gtm", "segment"] },
    ],
  },
  {
    type: "set_consent",
    label: "Set Tracking Consent",
    description: "Update analytics/advertising consent state (Consent Mode) so tags fire only with permission.",
    icon: "ShieldCheck",
    configFields: [
      { key: "analyticsConsent", label: "Analytics Storage", type: "enum", values: ["granted", "denied"], required: true },
      { key: "adConsent", label: "Ad Storage", type: "enum", values: ["granted", "denied"] },
    ],
  },
  {
    type: "download",
    label: "Download file",
    description: "Trigger a download of a stored asset or external file (PDF, image, media kit).",
    icon: "Download",
    configFields: [
      { key: "assetId", label: "Asset", type: "ref", refKind: "asset" },
      { key: "url", label: "External file URL", type: "string" },
      { key: "filename", label: "Save as filename", type: "string" },
    ],
  },
  {
    type: "play_media",
    label: "Play media",
    description: "Play a target audio or video player block.",
    icon: "Play",
    configFields: [
      { key: "target", label: "Media block", type: "ref", required: true, refKind: "block" },
      { key: "muted", label: "Start muted", type: "boolean" },
      { key: "loop", label: "Loop", type: "boolean" },
    ],
  },
  {
    type: "pause_media",
    label: "Pause media",
    description: "Pause a target audio or video player block.",
    icon: "Pause",
    configFields: [
      { key: "target", label: "Media block", type: "ref", required: true, refKind: "block" },
    ],
  },
  {
    type: "toggle_media",
    label: "Play / pause toggle",
    description: "Toggle play and pause on a target media block (single button).",
    icon: "CirclePlay",
    configFields: [
      { key: "target", label: "Media block", type: "ref", required: true, refKind: "block" },
      { key: "toggleMute", label: "Toggle mute instead of play", type: "boolean" },
    ],
  },
  {
    type: "open_whatsapp_chat",
    label: "Open WhatsApp chat",
    description: "Open a WhatsApp conversation with a business number, optionally prefilled with a message (wa.me deep link).",
    icon: "MessageCircle",
    configFields: [
      { key: "phone", label: "Phone (E.164, no +)", type: "string", required: true },
      { key: "message", label: "Prefilled message", type: "string" },
    ],
  },
  {
    type: "click_to_call",
    label: "Click to call",
    description: "Start a phone call to the given number via a tel: link.",
    icon: "Phone",
    configFields: [
      { key: "phone", label: "Phone number", type: "string", required: true },
    ],
  },
  {
    type: "compose_email",
    label: "Compose email",
    description: "Open the visitor's email client with a prefilled mailto: message.",
    icon: "Mail",
    configFields: [
      { key: "to", label: "To address", type: "string", required: true },
      { key: "subject", label: "Subject", type: "string" },
      { key: "body", label: "Body", type: "string" },
      { key: "cc", label: "Cc", type: "string" },
    ],
  },
  {
    type: "open_chat_widget",
    label: "Open live chat",
    description: "Open the embedded live chat / support widget (Intercom, Crisp, custom) and optionally jump to a flow.",
    icon: "MessagesSquare",
    configFields: [
      { key: "provider", label: "Chat provider", type: "enum", values: ["intercom", "crisp", "tawk", "drift", "custom"], required: true },
      { key: "flow", label: "Open to flow / message", type: "string" },
    ],
  },
  {
    type: "login",
    label: "Log In",
    description: "Authenticate the visitor with credentials, SSO, or a magic link, establishing a session.",
    icon: "LogIn",
    configFields: [
      { key: "method", label: "Sign-in Method", type: "enum", values: ["password", "magic_link", "google", "github", "apple", "sso"], required: true },
      { key: "emailField", label: "Email Field (form binding)", type: "string" },
      { key: "passwordField", label: "Password Field (form binding)", type: "string" },
      { key: "ssoConnectionId", label: "SSO Connection", type: "ref", refKind: "endpoint" },
      { key: "rememberMe", label: "Keep Me Signed In", type: "boolean" },
      { key: "redirectAfter", label: "Redirect After Login", type: "ref", refKind: "page" },
    ],
  },
  {
    type: "logout",
    label: "Log Out",
    description: "End the current session, clear auth tokens, and optionally redirect.",
    icon: "LogOut",
    configFields: [
      { key: "scope", label: "Sign-out Scope", type: "enum", values: ["this_device", "all_devices"] },
      { key: "redirectAfter", label: "Redirect After Logout", type: "ref", refKind: "page" },
      { key: "clearLocalState", label: "Clear Cart & Local Data", type: "boolean" },
    ],
  },
  {
    type: "open_auth",
    label: "Open Auth Modal",
    description: "Open the authentication modal/drawer in a chosen mode (sign in, sign up, reset).",
    icon: "KeyRound",
    configFields: [
      { key: "mode", label: "Initial View", type: "enum", values: ["sign_in", "sign_up", "forgot_password", "magic_link"], required: true },
      { key: "presentation", label: "Presentation", type: "enum", values: ["modal", "drawer", "inline", "page"] },
      { key: "returnTo", label: "Return To (after success)", type: "ref", refKind: "page" },
      { key: "prefillEmail", label: "Prefill Email", type: "string" },
      { key: "title", label: "Heading Override", type: "string" },
    ],
  },
  {
    type: "require_auth",
    label: "Require Sign-in (Gate)",
    description: "Guard the actions that follow: if the visitor is authenticated they continue, otherwise the auth modal opens and the intended action is resumed after login.",
    icon: "ShieldCheck",
    configFields: [
      { key: "mode", label: "On Not Authenticated", type: "enum", values: ["open_modal", "redirect", "inline_message"], required: true },
      { key: "authMode", label: "Auth Modal View", type: "enum", values: ["sign_in", "sign_up", "magic_link"] },
      { key: "resumeAfterLogin", label: "Resume Action After Login", type: "boolean" },
      { key: "redirectTo", label: "Redirect To (if mode=redirect)", type: "ref", refKind: "page" },
      { key: "message", label: "Prompt Message", type: "string" },
    ],
  },
  {
    type: "require_role",
    label: "Require Plan / Role (Gate)",
    description: "Guard the following actions on entitlement: continue only if the user has the required plan/role, else show an upgrade or access prompt.",
    icon: "ShieldAlert",
    configFields: [
      { key: "requires", label: "Required Plan or Role", type: "enum", values: ["free", "pro", "business", "enterprise", "member", "admin"], required: true },
      { key: "onDenied", label: "When Not Entitled", type: "enum", values: ["upgrade_modal", "request_access", "redirect", "inline_message", "hide_block"], required: true },
      { key: "upgradeTarget", label: "Upgrade Page / Plan", type: "ref", refKind: "page" },
      { key: "message", label: "Denied Message", type: "string" },
    ],
  },
  {
    type: "start_checkout",
    label: "Start Plan Upgrade",
    description: "Kick off a plan upgrade / subscription checkout for a target plan.",
    icon: "BadgeDollarSign",
    configFields: [
      { key: "plan", label: "Target Plan", type: "enum", values: ["pro", "business", "enterprise"], required: true },
      { key: "billingPeriod", label: "Billing Period", type: "enum", values: ["monthly", "annual"] },
      { key: "checkoutEndpoint", label: "Billing Endpoint", type: "ref", refKind: "endpoint" },
      { key: "successPage", label: "Success Page", type: "ref", refKind: "page" },
    ],
  },
];

// Real-life interaction recipes (trigger -> actions), deduped by id.
export const EVENT_RECIPES: EventRecipe[] = [
  {
    id: "cta-go-to-pricing",
    label: "CTA â†’ go to Pricing page",
    category: "Page navigation",
    icon: "ArrowRight",
    description: "A hero or nav button takes the visitor to an internal page like Pricing.",
    trigger: "on_click",
    actions: [
      {
        type: "navigate",
        config: [
          { key: "route", value: "page_pricing" },
          { key: "preserveScroll", value: "false" },
        ],
      },
    ],
  },
  {
    id: "open-docs-new-tab",
    label: "Open docs in new tab",
    category: "External links",
    icon: "ExternalLink",
    description: "A 'Documentation' link opens an external site safely in a new browser tab.",
    trigger: "on_click",
    actions: [
      {
        type: "open_url",
        config: [
          { key: "url", value: "https://docs.flowblok.com" },
          { key: "target", value: "_blank" },
          { key: "rel", value: "noopener noreferrer" },
        ],
      },
    ],
  },
  {
    id: "anchor-scroll-to-features",
    label: "Anchor link â†’ scroll to Features",
    category: "Same-page anchors",
    icon: "MousePointerClick",
    description: "A header menu item smooth-scrolls down to the Features section with a sticky-header offset.",
    trigger: "on_click",
    actions: [
      {
        type: "scroll_to",
        config: [
          { key: "target", value: "block_features_section" },
          { key: "behavior", value: "smooth" },
          { key: "align", value: "start" },
          { key: "offset", value: "80" },
        ],
      },
    ],
  },
  {
    id: "back-button",
    label: "Back button",
    category: "History",
    icon: "ArrowLeft",
    description: "A 'Back' button returns to the previous page, falling back to the homepage if there is no history.",
    trigger: "on_click",
    actions: [
      {
        type: "go_back",
        config: [
          { key: "fallbackRoute", value: "page_home" },
        ],
      },
    ],
  },
  {
    id: "form-submit-redirect-thankyou",
    label: "On form success â†’ redirect to Thank You",
    category: "Redirect after action",
    icon: "CornerDownRight",
    description: "After a lead/contact form submits successfully, send the visitor to a Thank You page.",
    trigger: "on_success",
    actions: [
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Thanks! Redirecting you nowâ€¦" },
          { key: "tone", value: "success" },
        ],
      },
      {
        type: "redirect_after",
        config: [
          { key: "route", value: "page_thank_you" },
          { key: "delayMs", value: "800" },
        ],
      },
    ],
  },
  {
    id: "checkout-success-redirect-order",
    label: "On checkout success â†’ order confirmation",
    category: "Redirect after action",
    icon: "CircleCheck",
    description: "When checkout completes, redirect to the order-confirmation page with the order id in the URL.",
    trigger: "on_success",
    actions: [
      {
        type: "redirect_after",
        config: [
          { key: "route", value: "page_order_confirmation" },
          { key: "query", value: "orderId={{result.orderId}}" },
          { key: "replace", value: "true" },
        ],
      },
    ],
  },
  {
    id: "list-next-page",
    label: "Pagination â†’ Next page",
    category: "Pagination",
    icon: "ChevronRight",
    description: "A 'Next' button advances a product/blog list to the following page and syncs it to the URL.",
    trigger: "on_click",
    actions: [
      {
        type: "paginate",
        config: [
          { key: "target", value: "block_post_list" },
          { key: "direction", value: "next" },
          { key: "syncQueryParam", value: "true" },
        ],
      },
    ],
  },
  {
    id: "list-prev-page",
    label: "Pagination â†’ Previous page",
    category: "Pagination",
    icon: "ChevronLeft",
    description: "A 'Previous' button moves a product/blog list back one page and syncs it to the URL.",
    trigger: "on_click",
    actions: [
      {
        type: "paginate",
        config: [
          { key: "target", value: "block_post_list" },
          { key: "direction", value: "prev" },
          { key: "syncQueryParam", value: "true" },
        ],
      },
    ],
  },
  {
    id: "breadcrumb-go-to-parent",
    label: "Breadcrumb â†’ go to parent section",
    category: "Page navigation",
    icon: "ChevronsLeft",
    description: "A breadcrumb crumb routes back up to a parent listing page, e.g. from a product to its Category.",
    trigger: "on_click",
    actions: [
      {
        type: "navigate",
        config: [
          { key: "route", value: "page_category" },
          { key: "query", value: "slug={{item.categorySlug}}" },
        ],
      },
    ],
  },
  {
    id: "back-to-top",
    label: "Back to top",
    category: "Same-page anchors",
    icon: "ArrowUpToLine",
    description: "A floating 'Back to top' button smooth-scrolls the page to the very top.",
    trigger: "on_click",
    actions: [
      {
        type: "scroll_to_top",
        config: [
          { key: "behavior", value: "smooth" },
        ],
      },
    ],
  },
  {
    id: "deep-link-scroll-on-load",
    label: "On load â†’ scroll to anchor from URL",
    category: "Same-page anchors",
    icon: "Hash",
    description: "When the page mounts, deep-link visitors straight to the section named in the URL hash.",
    trigger: "on_load",
    actions: [
      {
        type: "scroll_to",
        config: [
          { key: "target", value: "{{url.hash}}" },
          { key: "behavior", value: "smooth" },
          { key: "offset", value: "80" },
        ],
      },
    ],
  },
  {
    id: "filter-change-update-url",
    label: "On filter change â†’ update URL & list",
    category: "Pagination",
    icon: "Link2",
    description: "Changing a category/sort dropdown writes the choice to the URL and resets the list to page 1 (shareable, Back-friendly).",
    trigger: "on_change",
    actions: [
      {
        type: "set_query_param",
        config: [
          { key: "params", value: "category={{value}}" },
          { key: "replace", value: "false" },
        ],
      },
      {
        type: "paginate",
        config: [
          { key: "target", value: "block_product_grid" },
          { key: "direction", value: "first" },
          { key: "syncQueryParam", value: "true" },
        ],
      },
    ],
  },
  {
    id: "wizard-next-step",
    label: "Wizard â†’ next step",
    category: "In-page steps",
    icon: "PanelTop",
    description: "A 'Continue' button advances a multi-step form/wizard and scrolls the new step into view.",
    trigger: "on_click",
    actions: [
      {
        type: "switch_tab",
        config: [
          { key: "target", value: "block_signup_wizard" },
          { key: "tab", value: "step_2" },
        ],
      },
      {
        type: "scroll_to",
        config: [
          { key: "target", value: "block_signup_wizard" },
          { key: "behavior", value: "smooth" },
          { key: "align", value: "start" },
        ],
      },
    ],
  },
  {
    id: "promo-track-then-navigate",
    label: "Promo banner â†’ track then go to offer",
    category: "Page navigation",
    icon: "MousePointer2",
    description: "Clicking a promo banner logs the click for analytics, then routes to the campaign landing page.",
    trigger: "on_click",
    actions: [
      {
        type: "track_event",
        config: [
          { key: "event", value: "promo_banner_click" },
          { key: "props", value: "campaign=summer_sale" },
        ],
      },
      {
        type: "navigate",
        config: [
          { key: "route", value: "page_summer_sale" },
          { key: "query", value: "utm_source=banner" },
        ],
      },
    ],
  },
  {
    id: "contact-to-crm-lead-confirm",
    label: "Contact form â†’ CRM lead + confirmation email",
    category: "Lead capture",
    icon: "UserPlus",
    description: "On submit, create a CRM lead from the contact form, email the visitor a confirmation, and show a success message.",
    trigger: "on_submit",
    actions: [
      {
        type: "create_lead",
        config: [
          { key: "crm", value: "crm_default" },
          { key: "fieldMap", value: "email=email; first_name=first_name; last_name=last_name; phone=phone; company=company; message=message" },
          { key: "source", value: "Website contact form" },
        ],
      },
      {
        type: "send_email",
        config: [
          { key: "template", value: "tmpl_contact_confirmation" },
          { key: "to", value: "{{form.email}}" },
          { key: "vars", value: "first_name={{form.first_name}}" },
        ],
      },
      {
        type: "inline_message",
        config: [
          { key: "message", value: "Thanks {{form.first_name}} â€” we got your message and will reply within one business day." },
          { key: "tone", value: "success" },
        ],
      },
    ],
  },
  {
    id: "newsletter-signup",
    label: "Newsletter signup",
    category: "Marketing",
    icon: "MailPlus",
    description: "On submit, add the email to the CRM marketing list, fire the welcome email, and track the conversion.",
    trigger: "on_submit",
    actions: [
      {
        type: "create_lead",
        config: [
          { key: "crm", value: "crm_default" },
          { key: "fieldMap", value: "email=email" },
          { key: "tags", value: "newsletter" },
          { key: "source", value: "Newsletter signup" },
        ],
      },
      {
        type: "send_email",
        config: [
          { key: "template", value: "tmpl_newsletter_welcome" },
          { key: "to", value: "{{form.email}}" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "newsletter_signup" },
          { key: "props", value: "list=general; placement=footer" },
        ],
      },
    ],
  },
  {
    id: "contact-route-via-workflow",
    label: "Contact form â†’ routing workflow",
    category: "Lead capture",
    icon: "Workflow",
    description: "On submit, hand the inquiry to a workflow that scores, assigns an owner, and routes it, then toast the user.",
    trigger: "on_submit",
    actions: [
      {
        type: "run_workflow",
        config: [
          { key: "workflowId", value: "wf_lead_router" },
          { key: "inputMap", value: "email=email; name=name; budget=budget; topic=topic; message=message" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Request received â€” routing it to the right team." },
          { key: "tone", value: "success" },
        ],
      },
    ],
  },
  {
    id: "save-record-to-table",
    label: "Save submission to database table",
    category: "Data capture",
    icon: "Database",
    description: "On submit, upsert the form data as a row in a database table and confirm inline.",
    trigger: "on_submit",
    actions: [
      {
        type: "save_record",
        config: [
          { key: "table", value: "tbl_submissions" },
          { key: "fieldMap", value: "email=email; name=name; payload=*" },
          { key: "mode", value: "upsert" },
          { key: "upsertKey", value: "email" },
        ],
      },
      {
        type: "set_variable",
        config: [
          { key: "name", value: "lastRecordId" },
          { key: "value", value: "{{result.id}}" },
        ],
      },
      {
        type: "inline_message",
        config: [
          { key: "message", value: "Saved. Your reference is {{result.id}}." },
          { key: "tone", value: "success" },
        ],
      },
    ],
  },
  {
    id: "validate-email-on-change",
    label: "Validate email as you type",
    category: "Validation",
    icon: "CheckCheck",
    description: "On change of the email input, validate the format and show an inline error if it's invalid.",
    trigger: "on_change",
    actions: [
      {
        type: "validate_field",
        config: [
          { key: "field", value: "email" },
          { key: "rule", value: "email" },
          { key: "errorMessage", value: "Please enter a valid email address." },
        ],
      },
    ],
  },
  {
    id: "validate-password-match-on-change",
    label: "Confirm passwords match",
    category: "Validation",
    icon: "ShieldCheck",
    description: "On change of the confirm-password field, check it matches the password field and flag mismatches inline.",
    trigger: "on_change",
    actions: [
      {
        type: "validate_field",
        config: [
          { key: "field", value: "confirm_password" },
          { key: "rule", value: "match_field" },
          { key: "ruleValue", value: "password" },
          { key: "errorMessage", value: "Passwords don't match." },
        ],
      },
    ],
  },
  {
    id: "multi-step-next",
    label: "Multi-step form: Next step",
    category: "Multi-step",
    icon: "ArrowRightCircle",
    description: "On click of Next, validate the current step and advance to the next one, scrolling to the top of the form.",
    trigger: "on_click",
    actions: [
      {
        type: "goto_step",
        config: [
          { key: "formId", value: "form_onboarding" },
          { key: "direction", value: "next" },
          { key: "validateCurrent", value: "true" },
        ],
      },
      {
        type: "scroll_to",
        config: [
          { key: "target", value: "block_form_onboarding" },
        ],
      },
    ],
  },
  {
    id: "multi-step-back",
    label: "Multi-step form: Previous step",
    category: "Multi-step",
    icon: "ArrowLeftCircle",
    description: "On click of Back, return to the previous step without re-validating.",
    trigger: "on_click",
    actions: [
      {
        type: "goto_step",
        config: [
          { key: "formId", value: "form_onboarding" },
          { key: "direction", value: "previous" },
          { key: "validateCurrent", value: "false" },
        ],
      },
    ],
  },
  {
    id: "booking-request",
    label: "Booking / appointment request",
    category: "Booking",
    icon: "CalendarCheck",
    description: "On submit, create an appointment request for the chosen slot, email the visitor a confirmation, and track the booking.",
    trigger: "on_submit",
    actions: [
      {
        type: "book_appointment",
        config: [
          { key: "calendar", value: "cal_consultations" },
          { key: "slotField", value: "slot" },
          { key: "durationField", value: "duration" },
          { key: "attendeeMap", value: "name=name; email=email; phone=phone; notes=notes" },
          { key: "status", value: "requested" },
        ],
      },
      {
        type: "send_email",
        config: [
          { key: "template", value: "tmpl_booking_request" },
          { key: "to", value: "{{form.email}}" },
          { key: "vars", value: "slot={{form.slot}}; name={{form.name}}" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "appointment_requested" },
          { key: "props", value: "type=consultation" },
        ],
      },
    ],
  },
  {
    id: "demo-request-redirect",
    label: "Demo request â†’ thank-you page",
    category: "Lead capture",
    icon: "Navigation",
    description: "On submit, create a high-intent CRM lead, notify sales via workflow, then redirect to a thank-you page.",
    trigger: "on_submit",
    actions: [
      {
        type: "create_lead",
        config: [
          { key: "crm", value: "crm_default" },
          { key: "fieldMap", value: "email=work_email; name=full_name; company=company; team_size=team_size" },
          { key: "tags", value: "demo-request,high-intent" },
          { key: "source", value: "Demo request" },
        ],
      },
      {
        type: "run_workflow",
        config: [
          { key: "workflowId", value: "wf_notify_sales" },
          { key: "inputMap", value: "email=work_email; company=company" },
        ],
      },
      {
        type: "redirect_after",
        config: [
          { key: "route", value: "/thank-you" },
          { key: "delayMs", value: "600" },
        ],
      },
    ],
  },
  {
    id: "support-ticket-via-api",
    label: "Support form â†’ create ticket",
    category: "Data capture",
    icon: "Webhook",
    description: "On submit, POST the support request to the ticketing endpoint, store the ticket id, and confirm inline.",
    trigger: "on_submit",
    actions: [
      {
        type: "call_api",
        config: [
          { key: "endpointId", value: "ep-support-tickets-create" },
          { key: "bodyMap", value: "subject=subject; description=message; priority=priority; requester_email=email" },
        ],
      },
      {
        type: "set_variable",
        config: [
          { key: "name", value: "ticketId" },
          { key: "value", value: "{{result.ticket_id}}" },
        ],
      },
      {
        type: "inline_message",
        config: [
          { key: "message", value: "Ticket #{{result.ticket_id}} created â€” we'll be in touch by email." },
          { key: "tone", value: "success" },
        ],
      },
    ],
  },
  {
    id: "submit-success-swap",
    label: "On success: hide form, show success panel",
    category: "Submission UX",
    icon: "EyeOff",
    description: "When the form's bound submission succeeds, hide the form block and reveal a thank-you panel.",
    trigger: "on_success",
    actions: [
      {
        type: "hide_block",
        config: [
          { key: "target", value: "block_contact_form" },
        ],
      },
      {
        type: "show_block",
        config: [
          { key: "target", value: "block_success_panel" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "form_submit_success" },
          { key: "props", value: "form=contact" },
        ],
      },
    ],
  },
  {
    id: "submit-error-recover",
    label: "On error: show message and scroll to it",
    category: "Submission UX",
    icon: "AlertTriangle",
    description: "When submission fails, surface an inline error, scroll to it, and track the failure for diagnostics.",
    trigger: "on_error",
    actions: [
      {
        type: "inline_message",
        config: [
          { key: "message", value: "Something went wrong submitting the form. Please try again." },
          { key: "tone", value: "error" },
        ],
      },
      {
        type: "scroll_to",
        config: [
          { key: "target", value: "block_form_error" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "form_submit_error" },
          { key: "props", value: "form=contact" },
        ],
      },
    ],
  },
  {
    id: "quote-request-full",
    label: "Quote request â†’ lead + table + emails",
    category: "Lead capture",
    icon: "FileText",
    description: "On submit, create a CRM lead, archive the request to a table, and email both the visitor and the sales inbox.",
    trigger: "on_submit",
    actions: [
      {
        type: "create_lead",
        config: [
          { key: "crm", value: "crm_default" },
          { key: "fieldMap", value: "email=email; name=name; phone=phone; service=service; budget=budget; details=details" },
          { key: "source", value: "Quote request" },
        ],
      },
      {
        type: "save_record",
        config: [
          { key: "table", value: "tbl_quote_requests" },
          { key: "fieldMap", value: "email=email; service=service; budget=budget; details=details" },
          { key: "mode", value: "insert" },
        ],
      },
      {
        type: "send_email",
        config: [
          { key: "template", value: "tmpl_quote_received" },
          { key: "to", value: "{{form.email}}" },
          { key: "vars", value: "name={{form.name}}; service={{form.service}}" },
        ],
      },
    ],
  },
  {
    id: "prefill-on-load",
    label: "Pre-fill form for known visitors",
    category: "Submission UX",
    icon: "UserCheck",
    description: "On block mount, look up the visitor by stored email and pre-fill the form fields from the CRM.",
    trigger: "on_load",
    actions: [
      {
        type: "call_api",
        config: [
          { key: "endpointId", value: "ep-crm-contact-lookup" },
          { key: "bodyMap", value: "email={{visitor.email}}" },
        ],
      },
      {
        type: "set_variable",
        config: [
          { key: "name", value: "prefill" },
          { key: "value", value: "{{result.contact}}" },
        ],
      },
    ],
  },
  {
    id: "add-to-cart-toast",
    label: "Add to Cart + Toast",
    category: "Cart",
    icon: "ShoppingCart",
    description: "Shopper clicks Add to Cart; item is added and a success toast confirms it.",
    trigger: "on_click",
    actions: [
      {
        type: "add_to_cart",
        config: [
          { key: "productId", value: "{{block.productId}}" },
          { key: "variantId", value: "{{block.selectedVariant}}" },
          { key: "qty", value: "1" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Added to your cart" },
          { key: "tone", value: "success" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "add_to_cart" },
          { key: "props", value: "productId={{block.productId}}, qty=1" },
        ],
      },
    ],
  },
  {
    id: "add-to-cart-open-drawer",
    label: "Add to Cart + Open Mini-Cart",
    category: "Cart",
    icon: "PanelRightOpen",
    description: "Add the item and slide open the cart drawer so the shopper can review and keep buying.",
    trigger: "on_click",
    actions: [
      {
        type: "add_to_cart",
        config: [
          { key: "productId", value: "{{block.productId}}" },
          { key: "variantId", value: "{{block.selectedVariant}}" },
          { key: "qty", value: "{{block.qty}}" },
        ],
      },
      {
        type: "open_cart_drawer",
        config: [
          { key: "target", value: "blk_cart_drawer" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "add_to_cart" },
          { key: "props", value: "source=pdp" },
        ],
      },
    ],
  },
  {
    id: "buy-now",
    label: "Buy Now (Add + Checkout)",
    category: "Checkout",
    icon: "Zap",
    description: "One-tap purchase: add the product then jump straight into express checkout.",
    trigger: "on_click",
    actions: [
      {
        type: "add_to_cart",
        config: [
          { key: "productId", value: "{{block.productId}}" },
          { key: "variantId", value: "{{block.selectedVariant}}" },
          { key: "qty", value: "{{block.qty}}" },
        ],
      },
      {
        type: "checkout",
        config: [
          { key: "checkoutMode", value: "express" },
          { key: "successUrl", value: "/order/confirmed" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "begin_checkout" },
          { key: "props", value: "flow=buy_now" },
        ],
      },
    ],
  },
  {
    id: "remove-from-cart",
    label: "Remove Line Item",
    category: "Cart",
    icon: "Trash2",
    description: "Remove an item from the cart and confirm with an inline message.",
    trigger: "on_click",
    actions: [
      {
        type: "remove_from_cart",
        config: [
          { key: "productId", value: "{{item.productId}}" },
          { key: "variantId", value: "{{item.variantId}}" },
        ],
      },
      {
        type: "inline_message",
        config: [
          { key: "target", value: "blk_cart_list" },
          { key: "message", value: "Item removed" },
          { key: "tone", value: "info" },
        ],
      },
    ],
  },
  {
    id: "increment-qty",
    label: "Increase Quantity",
    category: "Cart",
    icon: "Plus",
    description: "Step the line-item quantity up by one when the shopper taps the + control.",
    trigger: "on_click",
    actions: [
      {
        type: "update_cart_qty",
        config: [
          { key: "productId", value: "{{item.productId}}" },
          { key: "variantId", value: "{{item.variantId}}" },
          { key: "qty", value: "1" },
          { key: "mode", value: "increment" },
        ],
      },
    ],
  },
  {
    id: "update-qty-on-change",
    label: "Update Qty from Input",
    category: "Cart",
    icon: "Hash",
    description: "When the shopper edits the quantity field, sync the cart line to the new value.",
    trigger: "on_change",
    actions: [
      {
        type: "update_cart_qty",
        config: [
          { key: "productId", value: "{{item.productId}}" },
          { key: "variantId", value: "{{item.variantId}}" },
          { key: "qty", value: "{{event.value}}" },
          { key: "mode", value: "set" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "cart_qty_updated" },
          { key: "props", value: "productId={{item.productId}}, qty={{event.value}}" },
        ],
      },
    ],
  },
  {
    id: "apply-coupon",
    label: "Apply Coupon Code",
    category: "Promotions",
    icon: "Ticket",
    description: "Shopper submits a promo code; it is applied to the cart with success/error feedback.",
    trigger: "on_submit",
    actions: [
      {
        type: "apply_coupon",
        config: [
          { key: "code", value: "{{form.couponCode}}" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Discount applied" },
          { key: "tone", value: "success" },
        ],
      },
    ],
  },
  {
    id: "go-to-checkout",
    label: "Proceed to Checkout",
    category: "Checkout",
    icon: "CreditCard",
    description: "Send the shopper from the cart into the hosted checkout flow.",
    trigger: "on_click",
    actions: [
      {
        type: "checkout",
        config: [
          { key: "checkoutMode", value: "hosted" },
          { key: "successUrl", value: "/order/confirmed" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "begin_checkout" },
          { key: "props", value: "flow=cart" },
        ],
      },
    ],
  },
  {
    id: "toggle-wishlist",
    label: "Add to Wishlist",
    category: "Wishlist",
    icon: "Heart",
    description: "Save a product to the shopper's wishlist and confirm with a toast.",
    trigger: "on_click",
    actions: [
      {
        type: "add_to_wishlist",
        config: [
          { key: "productId", value: "{{block.productId}}" },
          { key: "variantId", value: "{{block.selectedVariant}}" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Saved to your wishlist" },
          { key: "tone", value: "success" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "add_to_wishlist" },
          { key: "props", value: "productId={{block.productId}}" },
        ],
      },
    ],
  },
  {
    id: "quick-view",
    label: "Quick-View Product Modal",
    category: "Discovery",
    icon: "Eye",
    description: "Open a product preview in a modal from a listing/grid card without a page load.",
    trigger: "on_click",
    actions: [
      {
        type: "quick_view",
        config: [
          { key: "productId", value: "{{card.productId}}" },
          { key: "target", value: "blk_quickview_modal" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "product_quick_view" },
          { key: "props", value: "productId={{card.productId}}" },
        ],
      },
    ],
  },
  {
    id: "notify-in-stock",
    label: "Notify When in Stock",
    category: "Inventory",
    icon: "BellRing",
    description: "On a sold-out product, capture the shopper's email for a back-in-stock alert.",
    trigger: "on_submit",
    actions: [
      {
        type: "notify_in_stock",
        config: [
          { key: "productId", value: "{{block.productId}}" },
          { key: "variantId", value: "{{block.selectedVariant}}" },
          { key: "email", value: "{{form.email}}" },
        ],
      },
      {
        type: "run_workflow",
        config: [
          { key: "workflowId", value: "wf_back_in_stock_subscribe" },
          { key: "input", value: "productId={{block.productId}}, email={{form.email}}" },
        ],
      },
      {
        type: "inline_message",
        config: [
          { key: "target", value: "blk_stock_form" },
          { key: "message", value: "We'll email you the moment it's back." },
          { key: "tone", value: "success" },
        ],
      },
    ],
  },
  {
    id: "checkout-success-redirect",
    label: "On Checkout Success â†’ Thank You",
    category: "Checkout",
    icon: "BadgeCheck",
    description: "When checkout succeeds, send the shopper to the thank-you page and fire a purchase event.",
    trigger: "on_success",
    actions: [
      {
        type: "track_event",
        config: [
          { key: "event", value: "purchase" },
          { key: "props", value: "orderId={{event.orderId}}, value={{event.total}}" },
        ],
      },
      {
        type: "navigate",
        config: [
          { key: "route", value: "/order/confirmed" },
        ],
      },
    ],
  },
  {
    id: "abandoned-cart-reminder",
    label: "Idle Cart Reminder Nudge",
    category: "Conversion",
    icon: "Clock",
    description: "After a period of inactivity with items in the cart, nudge the shopper to finish.",
    trigger: "on_interval",
    actions: [
      {
        type: "inline_message",
        config: [
          { key: "target", value: "blk_cart_banner" },
          { key: "message", value: "Still deciding? Your cart is saved." },
          { key: "tone", value: "info" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "cart_reminder_shown" },
          { key: "props", value: "trigger=idle" },
        ],
      },
    ],
  },
  {
    id: "share-product",
    label: "Share This Product",
    category: "Discovery",
    icon: "Share2",
    description: "Let the shopper share the current product via the native share sheet or copy link.",
    trigger: "on_click",
    actions: [
      {
        type: "share",
        config: [
          { key: "network", value: "native" },
          { key: "value", value: "{{page.url}}" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "product_shared" },
          { key: "props", value: "productId={{block.productId}}" },
        ],
      },
    ],
  },
  {
    id: "run-workflow-on-click-with-toast",
    label: "Run Workflow on Click",
    category: "Workflow",
    icon: "Workflow",
    description: "Click a button to kick off a saved automation, confirm with a toast, then refresh the results panel.",
    trigger: "on_click",
    actions: [
      {
        type: "run_workflow",
        config: [
          { key: "workflowId", value: "wf_lead_router" },
          { key: "runMode", value: "async" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Automation started" },
          { key: "tone", value: "info" },
        ],
      },
    ],
  },
  {
    id: "submit-to-api-endpoint",
    label: "Submit Form to API Endpoint",
    category: "API",
    icon: "Webhook",
    description: "On form submit, POST the form fields to a specific endpoint, then confirm success or surface an error inline.",
    trigger: "on_submit",
    actions: [
      {
        type: "call_api",
        config: [
          { key: "endpointId", value: "ep-crm-leads-create" },
          { key: "bodyMap", value: "name=field.name, email=field.email, message=field.message" },
          { key: "resultVar", value: "leadResult" },
        ],
      },
    ],
  },
  {
    id: "api-success-toast-refresh",
    label: "On API Success: Toast + Refresh",
    category: "API",
    icon: "RefreshCw",
    description: "When a bound API call succeeds, show a success toast and refresh the data block so the new record appears.",
    trigger: "on_success",
    actions: [
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Saved successfully" },
          { key: "tone", value: "success" },
        ],
      },
      {
        type: "reload_block",
        config: [
          { key: "target", value: "block.records_table" },
        ],
      },
    ],
  },
  {
    id: "api-error-inline-message",
    label: "On API Error: Inline Message",
    category: "API",
    icon: "MessageSquareWarning",
    description: "When a bound API call or workflow fails, show an inline error in the form so the user can retry.",
    trigger: "on_error",
    actions: [
      {
        type: "inline_message",
        config: [
          { key: "target", value: "block.form_error_slot" },
          { key: "message", value: "Something went wrong. Please try again." },
          { key: "tone", value: "error" },
        ],
      },
    ],
  },
  {
    id: "ai-generate-on-click",
    label: "AI Generate Content",
    category: "AI",
    icon: "Sparkles",
    description: "Click 'Generate' to run a prompt through AI and stream the result into a content block.",
    trigger: "on_click",
    actions: [
      {
        type: "ai_generate",
        config: [
          { key: "prompt", value: "Write a 3-sentence product blurb for {{field.product_name}} aimed at {{field.audience}}." },
          { key: "model", value: "balanced" },
          { key: "target", value: "block.generated_copy" },
          { key: "stream", value: "true" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "ai_generate_clicked" },
          { key: "props", value: "surface=blurb_generator" },
        ],
      },
    ],
  },
  {
    id: "ai-summarize-on-view",
    label: "AI Summarize Long Content",
    category: "AI",
    icon: "TextQuote",
    description: "When a long article block enters the viewport, generate a TL;DR summary into a callout above it.",
    trigger: "on_view",
    actions: [
      {
        type: "ai_summarize",
        config: [
          { key: "source", value: "block.article_body" },
          { key: "length", value: "bullets" },
          { key: "target", value: "block.tldr_callout" },
        ],
      },
    ],
  },
  {
    id: "ai-translate-on-change",
    label: "AI Translate on Language Change",
    category: "AI",
    icon: "Languages",
    description: "When the visitor picks a language from a dropdown, translate the content block into that language in place.",
    trigger: "on_change",
    actions: [
      {
        type: "ai_translate",
        config: [
          { key: "source", value: "block.body_copy" },
          { key: "targetLanguage", value: "{{field.language_select}}" },
          { key: "target", value: "block.body_copy" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Translated" },
          { key: "tone", value: "success" },
        ],
      },
    ],
  },
  {
    id: "ai-draft-then-save-via-api",
    label: "AI Draft then Save via API",
    category: "AI",
    icon: "PenLine",
    description: "Generate a draft with AI, store it as a variable, then persist it to the backend through an endpoint.",
    trigger: "on_click",
    actions: [
      {
        type: "ai_generate",
        config: [
          { key: "prompt", value: "Draft a reply to the support ticket: {{field.ticket_text}}" },
          { key: "model", value: "quality" },
          { key: "outputVar", value: "aiDraft" },
        ],
      },
      {
        type: "call_api",
        config: [
          { key: "endpointId", value: "ep-tickets-reply-create" },
          { key: "bodyMap", value: "ticketId=field.ticket_id, body=var.aiDraft" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Reply drafted and saved" },
          { key: "tone", value: "success" },
        ],
      },
    ],
  },
  {
    id: "refresh-dashboard-on-interval",
    label: "Auto-Refresh Data on Interval",
    category: "API",
    icon: "Timer",
    description: "Poll an endpoint on a timer and refresh a dashboard block so live metrics stay current.",
    trigger: "on_interval",
    actions: [
      {
        type: "call_api",
        config: [
          { key: "endpointId", value: "ep-metrics-latest" },
          { key: "resultVar", value: "metrics" },
        ],
      },
      {
        type: "reload_block",
        config: [
          { key: "target", value: "block.metrics_dashboard" },
        ],
      },
    ],
  },
  {
    id: "load-data-on-mount",
    label: "Load Data on Page Load",
    category: "API",
    icon: "Download",
    description: "When the block mounts, fetch its data from an endpoint and hide the loading skeleton.",
    trigger: "on_load",
    actions: [
      {
        type: "call_api",
        config: [
          { key: "endpointId", value: "ep-products-list" },
          { key: "queryMap", value: "category={{field.category}}, limit=12" },
          { key: "resultVar", value: "products" },
        ],
      },
      {
        type: "hide_block",
        config: [
          { key: "target", value: "block.loading_skeleton" },
        ],
      },
      {
        type: "show_block",
        config: [
          { key: "target", value: "block.products_grid" },
        ],
      },
    ],
  },
  {
    id: "trigger-automation-on-success",
    label: "Chain Automation After Save",
    category: "Workflow",
    icon: "GitBranch",
    description: "After a record is saved successfully, trigger a follow-up automation (e.g. notify Slack, enrich the lead).",
    trigger: "on_success",
    actions: [
      {
        type: "run_workflow",
        config: [
          { key: "workflowId", value: "wf_post_save_enrich" },
          { key: "inputMap", value: "recordId=var.leadResult.id" },
          { key: "runMode", value: "async" },
        ],
      },
    ],
  },
  {
    id: "ai-classify-route-submission",
    label: "AI Classify & Route Submission",
    category: "AI",
    icon: "Tags",
    description: "On submit, classify the message intent with AI, save the label, then run the workflow that routes by intent.",
    trigger: "on_submit",
    actions: [
      {
        type: "ai_classify",
        config: [
          { key: "source", value: "field.message" },
          { key: "labels", value: "sales, support, billing, other" },
          { key: "outputVar", value: "intent" },
        ],
      },
      {
        type: "run_workflow",
        config: [
          { key: "workflowId", value: "wf_intent_router" },
          { key: "inputMap", value: "intent=var.intent, email=field.email, message=field.message" },
        ],
      },
    ],
  },
  {
    id: "copy-ai-output-on-click",
    label: "Generate then Track",
    category: "AI",
    icon: "Sparkles",
    description: "Generate AI content and immediately log a usage event for analytics on AI feature adoption.",
    trigger: "on_click",
    actions: [
      {
        type: "ai_generate",
        config: [
          { key: "prompt", value: "Suggest 5 SEO titles for: {{field.topic}}" },
          { key: "model", value: "fast" },
          { key: "target", value: "block.title_suggestions" },
        ],
      },
      {
        type: "set_variable",
        config: [
          { key: "name", value: "lastGeneratedTopic" },
          { key: "value", value: "{{field.topic}}" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "ai_titles_generated" },
          { key: "props", value: "topic={{field.topic}}" },
        ],
      },
    ],
  },
  {
    id: "webhook-on-double-click-confirm",
    label: "Manual Sync Trigger",
    category: "Workflow",
    icon: "RotateCw",
    description: "Double-click a sync control to call the sync endpoint, then toast and refresh the synced list.",
    trigger: "on_double_click",
    actions: [
      {
        type: "call_api",
        config: [
          { key: "endpointId", value: "ep-sync-run" },
          { key: "bodyMap", value: "source={{field.source}}" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Sync triggered" },
          { key: "tone", value: "info" },
        ],
      },
      {
        type: "reload_block",
        config: [
          { key: "target", value: "block.synced_list" },
        ],
      },
    ],
  },
  {
    id: "open-signup-modal-on-click",
    label: "Open Sign-up Modal on Click",
    category: "Modals & Drawers",
    icon: "SquareStack",
    description: "A CTA button opens a sign-up modal without leaving the page.",
    trigger: "on_click",
    actions: [
      {
        type: "open_modal",
        config: [
          { key: "target", value: "modal_signup" },
          { key: "backdrop", value: "true" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "signup_modal_opened" },
          { key: "props", value: "{\"source\":\"hero_cta\"}" },
        ],
      },
    ],
  },
  {
    id: "exit-intent-promo-modal",
    label: "Welcome / Promo Modal on Load",
    category: "Modals & Drawers",
    icon: "Gift",
    description: "Show a promo modal once the page mounts to capture first-time visitors.",
    trigger: "on_load",
    actions: [
      {
        type: "open_modal",
        config: [
          { key: "target", value: "modal_promo_welcome" },
          { key: "backdrop", value: "true" },
        ],
      },
    ],
  },
  {
    id: "open-cart-drawer-on-click",
    label: "Open Cart Drawer on Click",
    category: "Modals & Drawers",
    icon: "PanelRightOpen",
    description: "The cart icon slides in a right-side cart drawer.",
    trigger: "on_click",
    actions: [
      {
        type: "open_drawer",
        config: [
          { key: "target", value: "drawer_cart" },
          { key: "side", value: "right" },
        ],
      },
    ],
  },
  {
    id: "mobile-nav-drawer-toggle",
    label: "Open Mobile Nav Drawer",
    category: "Modals & Drawers",
    icon: "Menu",
    description: "Hamburger button opens the left navigation drawer on mobile.",
    trigger: "on_click",
    actions: [
      {
        type: "open_drawer",
        config: [
          { key: "target", value: "drawer_mobile_nav" },
          { key: "side", value: "left" },
        ],
      },
    ],
  },
  {
    id: "toggle-faq-accordion",
    label: "Toggle FAQ Accordion Item",
    category: "Toggles & Tabs",
    icon: "ChevronsUpDown",
    description: "Clicking an FAQ question expands or collapses its answer.",
    trigger: "on_click",
    actions: [
      {
        type: "toggle_block",
        config: [
          { key: "target", value: "block_faq_answer_1" },
          { key: "animation", value: "collapse" },
        ],
      },
    ],
  },
  {
    id: "switch-pricing-tab",
    label: "Switch Pricing Tab",
    category: "Toggles & Tabs",
    icon: "LayoutPanelTop",
    description: "Toggle between Monthly and Annual pricing tabs.",
    trigger: "on_click",
    actions: [
      {
        type: "select_tab",
        config: [
          { key: "target", value: "tabs_pricing" },
          { key: "tabId", value: "annual" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "pricing_tab_switched" },
          { key: "props", value: "{\"plan_period\":\"annual\"}" },
        ],
      },
    ],
  },
  {
    id: "copy-promo-code",
    label: "Copy Promo Code",
    category: "Clipboard & Sharing",
    icon: "TicketPercent",
    description: "Click to copy a discount code and confirm with a success toast.",
    trigger: "on_click",
    actions: [
      {
        type: "copy_clipboard",
        config: [
          { key: "value", value: "SAVE20" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Code SAVE20 copied to clipboard" },
          { key: "tone", value: "success" },
          { key: "duration", value: "2500" },
        ],
      },
    ],
  },
  {
    id: "copy-share-link",
    label: "Copy Share Link",
    category: "Clipboard & Sharing",
    icon: "Link",
    description: "Copy the current page/referral link and confirm via toast.",
    trigger: "on_click",
    actions: [
      {
        type: "copy_clipboard",
        config: [
          { key: "value", value: "{{page.url}}?ref={{user.referralCode}}" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Link copied" },
          { key: "tone", value: "success" },
          { key: "duration", value: "2000" },
        ],
      },
    ],
  },
  {
    id: "toggle-dark-mode",
    label: "Toggle Dark Mode",
    category: "Theme",
    icon: "MoonStar",
    description: "A theme switch flips the site between light and dark mode.",
    trigger: "on_click",
    actions: [
      {
        type: "toggle_theme",
        config: [
          { key: "mode", value: "toggle" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "theme_toggled" },
        ],
      },
    ],
  },
  {
    id: "form-success-feedback",
    label: "Confirm on Form Success",
    category: "Toasts & Feedback",
    icon: "CheckCircle2",
    description: "When a bound form/workflow succeeds, toast confirmation and reveal a thank-you block.",
    trigger: "on_success",
    actions: [
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Thanks! We'll be in touch shortly." },
          { key: "tone", value: "success" },
          { key: "duration", value: "4000" },
        ],
      },
      {
        type: "show_block",
        config: [
          { key: "target", value: "block_thank_you" },
          { key: "animation", value: "fade" },
        ],
      },
      {
        type: "hide_block",
        config: [
          { key: "target", value: "block_lead_form" },
          { key: "animation", value: "fade" },
        ],
      },
    ],
  },
  {
    id: "error-feedback-inline",
    label: "Show Error Feedback",
    category: "Toasts & Feedback",
    icon: "TriangleAlert",
    description: "When a bound API/workflow errors, show an inline error and an error toast.",
    trigger: "on_error",
    actions: [
      {
        type: "inline_message",
        config: [
          { key: "target", value: "block_form_errors" },
          { key: "message", value: "Something went wrong. Please try again." },
          { key: "tone", value: "error" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Submission failed" },
          { key: "tone", value: "error" },
          { key: "duration", value: "4000" },
        ],
      },
    ],
  },
  {
    id: "reveal-on-view",
    label: "Reveal-on-View Animation",
    category: "Reveal & Scroll",
    icon: "Sparkles",
    description: "Fade-and-rise a section into view as the visitor scrolls to it.",
    trigger: "on_view",
    actions: [
      {
        type: "animate_block",
        config: [
          { key: "target", value: "block_feature_grid" },
          { key: "effect", value: "fade-up" },
          { key: "duration", value: "600" },
          { key: "delay", value: "100" },
        ],
      },
    ],
  },
  {
    id: "show-tooltip-on-hover",
    label: "Show Tooltip on Hover",
    category: "Tooltips & Popovers",
    icon: "MessageCircleQuestion",
    description: "Hovering a help icon reveals an explanatory tooltip.",
    trigger: "on_hover",
    actions: [
      {
        type: "toggle_tooltip",
        config: [
          { key: "target", value: "popover_field_help" },
          { key: "placement", value: "top" },
        ],
      },
    ],
  },
  {
    id: "scroll-to-pricing",
    label: "Scroll to Section",
    category: "Reveal & Scroll",
    icon: "MousePointerClick",
    description: "An anchor button smooth-scrolls down to the pricing section.",
    trigger: "on_click",
    actions: [
      {
        type: "scroll_to",
        config: [
          { key: "target", value: "block_pricing" },
          { key: "behavior", value: "smooth" },
        ],
      },
    ],
  },
  {
    id: "conditional-shipping-fields",
    label: "Reveal Fields on Change",
    category: "Toggles & Tabs",
    icon: "Eye",
    description: "Checking 'ship to different address' reveals the extra address block.",
    trigger: "on_change",
    actions: [
      {
        type: "show_block",
        config: [
          { key: "target", value: "block_shipping_address" },
          { key: "animation", value: "slide-down" },
        ],
      },
    ],
  },
  {
    id: "track-cta-click",
    label: "Track CTA Click",
    category: "Engagement",
    icon: "MousePointerClick",
    description: "When a visitor clicks a hero or pricing CTA, log a named click event with the button label and location.",
    trigger: "on_click",
    actions: [
      {
        type: "track_event",
        config: [
          { key: "event", value: "cta_click" },
          { key: "props", value: "{ \"label\": \"{{block.text}}\", \"location\": \"{{page.path}}\", \"variant\": \"primary\" }" },
          { key: "destinations", value: "all" },
        ],
      },
    ],
  },
  {
    id: "fire-pageview-on-load",
    label: "Fire Pageview on Load",
    category: "Pageviews",
    icon: "FileText",
    description: "On page mount, send a pageview to GA4/GTM â€” works for SPA route changes where the platform reuses the shell.",
    trigger: "on_load",
    actions: [
      {
        type: "track_pageview",
        config: [
          { key: "path", value: "{{page.path}}" },
          { key: "title", value: "{{page.title}}" },
          { key: "referrer", value: "{{page.referrer}}" },
          { key: "destinations", value: "all" },
        ],
      },
    ],
  },
  {
    id: "track-form-conversion",
    label: "Track Form Conversion",
    category: "Conversions",
    icon: "Target",
    description: "When a bound lead/signup form submits successfully, fire a conversion with value plus a GTM dataLayer push.",
    trigger: "on_success",
    actions: [
      {
        type: "track_conversion",
        config: [
          { key: "conversionId", value: "lead_submit" },
          { key: "value", value: "0" },
          { key: "currency", value: "USD" },
          { key: "destinations", value: "all" },
        ],
      },
      {
        type: "push_datalayer",
        config: [
          { key: "event", value: "generate_lead" },
          { key: "payload", value: "{ \"form_id\": \"{{form.id}}\", \"source\": \"{{page.path}}\" }" },
        ],
      },
    ],
  },
  {
    id: "track-purchase-conversion",
    label: "Track Purchase",
    category: "Conversions",
    icon: "ShoppingCart",
    description: "After checkout completes, report a purchase conversion with order value to GA4, Google Ads and Meta Pixel.",
    trigger: "on_success",
    actions: [
      {
        type: "track_conversion",
        config: [
          { key: "conversionId", value: "purchase" },
          { key: "value", value: "{{order.total}}" },
          { key: "currency", value: "{{order.currency}}" },
          { key: "transactionId", value: "{{order.id}}" },
          { key: "destinations", value: "all" },
        ],
      },
    ],
  },
  {
    id: "track-scroll-depth",
    label: "Track Scroll Depth",
    category: "Engagement",
    icon: "MoveVertical",
    description: "When a section scrolls into view, emit a scroll-depth milestone so you can see how far readers get.",
    trigger: "on_view",
    actions: [
      {
        type: "track_scroll_depth",
        config: [
          { key: "threshold", value: "section_seen" },
          { key: "label", value: "{{block.name}}" },
          { key: "destinations", value: "all" },
        ],
      },
    ],
  },
  {
    id: "track-outbound-link",
    label: "Track Outbound Link",
    category: "Engagement",
    icon: "ExternalLink",
    description: "When a visitor clicks an external link, log the outbound click, then open the URL in a new tab.",
    trigger: "on_click",
    actions: [
      {
        type: "track_outbound",
        config: [
          { key: "url", value: "{{block.href}}" },
          { key: "linkText", value: "{{block.text}}" },
          { key: "destinations", value: "all" },
        ],
      },
      {
        type: "open_url",
        config: [
          { key: "url", value: "{{block.href}}" },
          { key: "target", value: "_blank" },
        ],
      },
    ],
  },
  {
    id: "identify-on-login",
    label: "Identify User on Login",
    category: "Identity",
    icon: "UserCheck",
    description: "After a successful login, identify the visitor with their user id and traits so sessions stitch to a profile.",
    trigger: "on_success",
    actions: [
      {
        type: "identify_user",
        config: [
          { key: "userId", value: "{{user.id}}" },
          { key: "traits", value: "{ \"email\": \"{{user.email}}\", \"plan\": \"{{user.plan}}\", \"name\": \"{{user.name}}\" }" },
          { key: "destinations", value: "all" },
        ],
      },
    ],
  },
  {
    id: "custom-event-with-props",
    label: "Custom Event with Props",
    category: "Custom Events",
    icon: "Activity",
    description: "Fire a fully custom analytics event with your own name and property map on any interaction.",
    trigger: "on_click",
    actions: [
      {
        type: "track_event",
        config: [
          { key: "event", value: "custom_event" },
          { key: "props", value: "{ \"category\": \"engagement\", \"value\": \"\" }" },
          { key: "destinations", value: "all" },
        ],
      },
    ],
  },
  {
    id: "track-video-play",
    label: "Track Video Play",
    category: "Media",
    icon: "Play",
    description: "When a visitor starts a video block, log a video_start event with the asset title for media engagement reports.",
    trigger: "on_click",
    actions: [
      {
        type: "track_event",
        config: [
          { key: "event", value: "video_start" },
          { key: "props", value: "{ \"video_title\": \"{{block.title}}\", \"video_id\": \"{{block.assetId}}\" }" },
          { key: "destinations", value: "all" },
        ],
      },
    ],
  },
  {
    id: "track-file-download",
    label: "Track File Download",
    category: "Engagement",
    icon: "Download",
    description: "When a visitor clicks a download link, log a file_download event, then trigger the actual download.",
    trigger: "on_click",
    actions: [
      {
        type: "track_event",
        config: [
          { key: "event", value: "file_download" },
          { key: "props", value: "{ \"file_name\": \"{{block.fileName}}\", \"file_type\": \"{{block.fileType}}\" }" },
          { key: "destinations", value: "all" },
        ],
      },
      {
        type: "download",
        config: [
          { key: "assetId", value: "{{block.assetId}}" },
        ],
      },
    ],
  },
  {
    id: "gtm-datalayer-on-view",
    label: "Push Promo View to GTM",
    category: "GTM / dataLayer",
    icon: "Layers",
    description: "When a promo/banner enters the viewport, push a view_promotion event to the GTM dataLayer for tag triggering.",
    trigger: "on_view",
    actions: [
      {
        type: "push_datalayer",
        config: [
          { key: "event", value: "view_promotion" },
          { key: "payload", value: "{ \"promotion_id\": \"{{block.promoId}}\", \"creative_name\": \"{{block.name}}\", \"position\": \"{{page.path}}\" }" },
        ],
      },
    ],
  },
  {
    id: "track-add-to-cart",
    label: "Track Add to Cart",
    category: "Ecommerce",
    icon: "ShoppingBag",
    description: "When a product is added to cart, fire an add_to_cart analytics event alongside the cart action.",
    trigger: "on_click",
    actions: [
      {
        type: "add_to_cart",
        config: [
          { key: "productId", value: "{{product.id}}" },
          { key: "qty", value: "1" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "add_to_cart" },
          { key: "props", value: "{ \"item_id\": \"{{product.id}}\", \"item_name\": \"{{product.name}}\", \"price\": \"{{product.price}}\", \"currency\": \"{{product.currency}}\" }" },
          { key: "destinations", value: "all" },
        ],
      },
    ],
  },
  {
    id: "grant-consent-then-pageview",
    label: "Grant Consent & Fire Pageview",
    category: "Consent",
    icon: "ShieldCheck",
    description: "When the visitor accepts cookies, grant analytics consent then fire the deferred initial pageview.",
    trigger: "on_click",
    actions: [
      {
        type: "set_consent",
        config: [
          { key: "analyticsConsent", value: "granted" },
          { key: "adConsent", value: "granted" },
        ],
      },
      {
        type: "track_pageview",
        config: [
          { key: "path", value: "{{page.path}}" },
          { key: "title", value: "{{page.title}}" },
          { key: "destinations", value: "all" },
        ],
      },
    ],
  },
  {
    id: "track-signup-cta-and-route",
    label: "Track Signup CTA & Continue",
    category: "Conversions",
    icon: "UserPlus",
    description: "When the signup CTA is clicked, fire begin_signup, push it to dataLayer, then navigate to the signup route.",
    trigger: "on_click",
    actions: [
      {
        type: "track_event",
        config: [
          { key: "event", value: "begin_signup" },
          { key: "props", value: "{ \"cta_location\": \"{{page.path}}\", \"plan\": \"{{block.plan}}\" }" },
          { key: "destinations", value: "all" },
        ],
      },
      {
        type: "push_datalayer",
        config: [
          { key: "event", value: "begin_signup" },
          { key: "payload", value: "{ \"plan\": \"{{block.plan}}\" }" },
        ],
      },
      {
        type: "navigate",
        config: [
          { key: "route", value: "/signup" },
        ],
      },
    ],
  },
  {
    id: "native-share-current-page",
    label: "Native share this page",
    category: "Sharing",
    icon: "Share2",
    description: "On mobile, opens the OS share sheet for the current page; tracks the share.",
    trigger: "on_click",
    actions: [
      {
        type: "share",
        config: [
          { key: "network", value: "native" },
          { key: "url", value: "{{page.url}}" },
          { key: "text", value: "{{page.title}}" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "share_clicked" },
          { key: "props", value: "{network:'native', url:'{{page.url}}'}" },
        ],
      },
    ],
  },
  {
    id: "share-to-x",
    label: "Share to X (Twitter)",
    category: "Sharing",
    icon: "Twitter",
    description: "Opens the X compose dialog prefilled with the page title, link and hashtags.",
    trigger: "on_click",
    actions: [
      {
        type: "share",
        config: [
          { key: "network", value: "x" },
          { key: "url", value: "{{page.url}}" },
          { key: "text", value: "{{page.title}}" },
          { key: "hashtags", value: "flowblok,build" },
          { key: "via", value: "flowblok" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "share_clicked" },
          { key: "props", value: "{network:'x'}" },
        ],
      },
    ],
  },
  {
    id: "share-to-linkedin",
    label: "Share to LinkedIn",
    category: "Sharing",
    icon: "Linkedin",
    description: "Opens the LinkedIn share dialog for the current page URL.",
    trigger: "on_click",
    actions: [
      {
        type: "share",
        config: [
          { key: "network", value: "linkedin" },
          { key: "url", value: "{{page.url}}" },
          { key: "text", value: "{{page.title}}" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "share_clicked" },
          { key: "props", value: "{network:'linkedin'}" },
        ],
      },
    ],
  },
  {
    id: "share-to-facebook",
    label: "Share to Facebook",
    category: "Sharing",
    icon: "Facebook",
    description: "Opens the Facebook sharer dialog for the current page.",
    trigger: "on_click",
    actions: [
      {
        type: "share",
        config: [
          { key: "network", value: "facebook" },
          { key: "url", value: "{{page.url}}" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "share_clicked" },
          { key: "props", value: "{network:'facebook'}" },
        ],
      },
    ],
  },
  {
    id: "share-to-whatsapp",
    label: "Share via WhatsApp",
    category: "Sharing",
    icon: "MessageCircle",
    description: "Opens WhatsApp with the page link and a short message ready to forward.",
    trigger: "on_click",
    actions: [
      {
        type: "share",
        config: [
          { key: "network", value: "whatsapp" },
          { key: "url", value: "{{page.url}}" },
          { key: "text", value: "Check this out: {{page.title}}" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "share_clicked" },
          { key: "props", value: "{network:'whatsapp'}" },
        ],
      },
    ],
  },
  {
    id: "generate-copy-referral-link",
    label: "Copy my referral link",
    category: "Sharing",
    icon: "Gift",
    description: "Generates a personalized referral link via API, copies it, and shows a toast.",
    trigger: "on_click",
    actions: [
      {
        type: "call_api",
        config: [
          { key: "endpointId", value: "ep-referral-link-create" },
          { key: "body", value: "{userId:'{{user.id}}', source:'{{page.slug}}'}" },
        ],
      },
      {
        type: "set_variable",
        config: [
          { key: "name", value: "referralLink" },
          { key: "value", value: "{{response.url}}" },
        ],
      },
      {
        type: "copy_clipboard",
        config: [
          { key: "value", value: "{{vars.referralLink}}" },
        ],
      },
    ],
  },
  {
    id: "download-pdf-guide",
    label: "Download PDF / brochure",
    category: "Media & Files",
    icon: "FileDown",
    description: "Downloads a stored PDF asset and records the download event.",
    trigger: "on_click",
    actions: [
      {
        type: "download",
        config: [
          { key: "assetId", value: "asset_brochure_2026" },
          { key: "filename", value: "flowblok-brochure.pdf" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "asset_downloaded" },
          { key: "props", value: "{assetId:'asset_brochure_2026', type:'pdf'}" },
        ],
      },
    ],
  },
  {
    id: "download-media-kit",
    label: "Download media kit",
    category: "Media & Files",
    icon: "Download",
    description: "Downloads the press/media kit zip and shows a thank-you toast.",
    trigger: "on_click",
    actions: [
      {
        type: "download",
        config: [
          { key: "assetId", value: "asset_media_kit" },
          { key: "filename", value: "media-kit.zip" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Your download is starting" },
          { key: "tone", value: "info" },
        ],
      },
    ],
  },
  {
    id: "video-play-on-view",
    label: "Auto-play video on scroll into view",
    category: "Media & Files",
    icon: "Play",
    description: "Starts the hero video (muted) when it enters the viewport.",
    trigger: "on_view",
    actions: [
      {
        type: "play_media",
        config: [
          { key: "target", value: "block_hero_video" },
          { key: "muted", value: "true" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "video_autoplay" },
          { key: "props", value: "{block:'block_hero_video'}" },
        ],
      },
    ],
  },
  {
    id: "video-play-pause-toggle",
    label: "Play / pause button",
    category: "Media & Files",
    icon: "CirclePlay",
    description: "A single button that toggles play and pause on a video block.",
    trigger: "on_click",
    actions: [
      {
        type: "toggle_media",
        config: [
          { key: "target", value: "block_product_video" },
        ],
      },
    ],
  },
  {
    id: "pause-video-on-modal-open",
    label: "Pause video when modal opens",
    category: "Media & Files",
    icon: "Pause",
    description: "Pauses background video when a modal/lightbox is opened to avoid double audio.",
    trigger: "on_click",
    actions: [
      {
        type: "pause_media",
        config: [
          { key: "target", value: "block_bg_video" },
        ],
      },
      {
        type: "open_modal",
        config: [
          { key: "target", value: "modal_signup" },
        ],
      },
    ],
  },
  {
    id: "whatsapp-chat-business",
    label: "Chat with us on WhatsApp",
    category: "Contact & Chat",
    icon: "MessageCircle",
    description: "Opens a WhatsApp conversation with the business number, prefilled with an intro message.",
    trigger: "on_click",
    actions: [
      {
        type: "open_whatsapp_chat",
        config: [
          { key: "phone", value: "15551234567" },
          { key: "message", value: "Hi! I have a question about your services." },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "whatsapp_chat_opened" },
        ],
      },
    ],
  },
  {
    id: "click-to-call",
    label: "Call us now",
    category: "Contact & Chat",
    icon: "Phone",
    description: "Starts a phone call to the sales line (tel: link) and tracks the click.",
    trigger: "on_click",
    actions: [
      {
        type: "click_to_call",
        config: [
          { key: "phone", value: "+15551234567" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "call_clicked" },
        ],
      },
    ],
  },
  {
    id: "mailto-compose",
    label: "Email us",
    category: "Contact & Chat",
    icon: "Mail",
    description: "Opens the visitor's email client prefilled with a subject and recipient.",
    trigger: "on_click",
    actions: [
      {
        type: "compose_email",
        config: [
          { key: "to", value: "hello@example.com" },
          { key: "subject", value: "Website enquiry" },
          { key: "body", value: "Hi team," },
        ],
      },
    ],
  },
  {
    id: "open-live-chat",
    label: "Open live chat widget",
    category: "Contact & Chat",
    icon: "MessagesSquare",
    description: "Opens the embedded support chat widget so the visitor can talk to an agent.",
    trigger: "on_click",
    actions: [
      {
        type: "open_chat_widget",
        config: [
          { key: "provider", value: "intercom" },
          { key: "flow", value: "sales-intro" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "livechat_opened" },
        ],
      },
    ],
  },
  {
    id: "share-after-purchase",
    label: "Prompt share after success",
    category: "Sharing",
    icon: "PartyPopper",
    description: "After a successful checkout/submit, shows a toast inviting the buyer to share their purchase.",
    trigger: "on_success",
    actions: [
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Thanks! Tell your friends ðŸŽ‰" },
          { key: "tone", value: "success" },
        ],
      },
      {
        type: "share",
        config: [
          { key: "network", value: "native" },
          { key: "url", value: "{{page.url}}" },
          { key: "text", value: "I just got mine from {{site.name}}!" },
        ],
      },
    ],
  },
  {
    id: "pinterest-save-image",
    label: "Save image to Pinterest",
    category: "Sharing",
    icon: "Image",
    description: "Opens the Pinterest 'Pin it' dialog for a product image.",
    trigger: "on_click",
    actions: [
      {
        type: "share",
        config: [
          { key: "network", value: "pinterest" },
          { key: "url", value: "{{page.url}}" },
          { key: "text", value: "{{product.name}}" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "share_clicked" },
          { key: "props", value: "{network:'pinterest'}" },
        ],
      },
    ],
  },
  {
    id: "floating-whatsapp-on-load",
    label: "Floating WhatsApp button",
    category: "Contact & Chat",
    icon: "MessageCircle",
    description: "Reveals a floating WhatsApp contact button shortly after the page loads.",
    trigger: "on_load",
    actions: [
      {
        type: "show_block",
        config: [
          { key: "target", value: "block_wa_float" },
        ],
      },
    ],
  },
  {
    id: "open-signin-modal",
    label: "Open Sign-in Modal",
    category: "Auth Entry",
    icon: "LogIn",
    description: "A header 'Sign in' button opens the auth modal in sign-in mode.",
    trigger: "on_click",
    actions: [
      {
        type: "open_auth",
        config: [
          { key: "mode", value: "sign_in" },
          { key: "presentation", value: "modal" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "auth_modal_opened" },
          { key: "props", value: "{\"source\":\"header\",\"mode\":\"sign_in\"}" },
        ],
      },
    ],
  },
  {
    id: "open-signup-modal",
    label: "Open Sign-up Modal",
    category: "Auth Entry",
    icon: "UserPlus",
    description: "A 'Create account' CTA opens the auth modal pre-set to sign-up.",
    trigger: "on_click",
    actions: [
      {
        type: "open_auth",
        config: [
          { key: "mode", value: "sign_up" },
          { key: "presentation", value: "modal" },
          { key: "returnTo", value: "page_onboarding" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "signup_started" },
          { key: "props", value: "{\"source\":\"hero_cta\"}" },
        ],
      },
    ],
  },
  {
    id: "login-with-password",
    label: "Sign In with Email & Password",
    category: "Auth Action",
    icon: "KeyRound",
    description: "Submitting the sign-in form authenticates the user and routes them to their dashboard.",
    trigger: "on_submit",
    actions: [
      {
        type: "login",
        config: [
          { key: "method", value: "password" },
          { key: "emailField", value: "email" },
          { key: "passwordField", value: "password" },
          { key: "rememberMe", value: "true" },
          { key: "redirectAfter", value: "page_dashboard" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "login_succeeded" },
          { key: "props", value: "{\"method\":\"password\"}" },
        ],
      },
    ],
  },
  {
    id: "login-with-google",
    label: "Continue with Google",
    category: "Auth Action",
    icon: "Chrome",
    description: "A 'Continue with Google' button launches Google SSO and returns the user to the page they came from.",
    trigger: "on_click",
    actions: [
      {
        type: "login",
        config: [
          { key: "method", value: "google" },
          { key: "redirectAfter", value: "page_dashboard" },
        ],
      },
    ],
  },
  {
    id: "send-magic-link",
    label: "Send Magic Link",
    category: "Auth Action",
    icon: "Wand2",
    description: "Submitting just an email sends a passwordless magic-link and confirms with a toast.",
    trigger: "on_submit",
    actions: [
      {
        type: "login",
        config: [
          { key: "method", value: "magic_link" },
          { key: "emailField", value: "email" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Check your inbox for a sign-in link." },
          { key: "tone", value: "success" },
        ],
      },
    ],
  },
  {
    id: "gated-action-add-to-cart",
    label: "Gated Action: Sign-in Required",
    category: "Gated Action",
    icon: "ShieldCheck",
    description: "Clicking a member-only action runs it if signed in, otherwise opens the auth modal and resumes after login.",
    trigger: "on_click",
    actions: [
      {
        type: "set_variable",
        config: [
          { key: "name", value: "intent" },
          { key: "value", value: "save_item" },
        ],
      },
      {
        type: "require_auth",
        config: [
          { key: "mode", value: "open_modal" },
          { key: "authMode", value: "sign_in" },
          { key: "resumeAfterLogin", value: "true" },
          { key: "message", value: "Sign in to save this item." },
        ],
      },
      {
        type: "run_workflow",
        config: [
          { key: "workflowId", value: "wf_save_item" },
          { key: "input", value: "{\"itemId\":\"{{block.itemId}}\"}" },
        ],
      },
    ],
  },
  {
    id: "gated-download",
    label: "Gated Download (Sign-in to Get File)",
    category: "Gated Action",
    icon: "FileLock2",
    description: "A download button checks auth first; signed-in users get the file, others are prompted to sign in.",
    trigger: "on_click",
    actions: [
      {
        type: "require_auth",
        config: [
          { key: "mode", value: "open_modal" },
          { key: "authMode", value: "sign_up" },
          { key: "resumeAfterLogin", value: "true" },
          { key: "message", value: "Create a free account to download." },
        ],
      },
      {
        type: "call_api",
        config: [
          { key: "endpointId", value: "ep-assets-signed-url" },
          { key: "body", value: "{\"assetId\":\"{{block.assetId}}\"}" },
        ],
      },
    ],
  },
  {
    id: "upgrade-plan-cta",
    label: "Upgrade Plan CTA",
    category: "Plan & Entitlement",
    icon: "BadgeDollarSign",
    description: "A 'Go Pro' button starts the Pro upgrade checkout and tracks the intent.",
    trigger: "on_click",
    actions: [
      {
        type: "track_event",
        config: [
          { key: "event", value: "upgrade_clicked" },
          { key: "props", value: "{\"plan\":\"pro\",\"placement\":\"pricing_card\"}" },
        ],
      },
      {
        type: "start_checkout",
        config: [
          { key: "plan", value: "pro" },
          { key: "billingPeriod", value: "annual" },
          { key: "checkoutEndpoint", value: "ep-billing-create-checkout" },
          { key: "successPage", value: "page_upgrade_success" },
        ],
      },
    ],
  },
  {
    id: "pro-only-feature-gate",
    label: "Pro-only Feature (Upgrade Gate)",
    category: "Plan & Entitlement",
    icon: "ShieldAlert",
    description: "Clicking a Pro feature runs it for Pro users, else opens the upgrade modal.",
    trigger: "on_click",
    actions: [
      {
        type: "require_role",
        config: [
          { key: "requires", value: "pro" },
          { key: "onDenied", value: "upgrade_modal" },
          { key: "upgradeTarget", value: "page_pricing" },
          { key: "message", value: "This feature is part of the Pro plan." },
        ],
      },
      {
        type: "run_workflow",
        config: [
          { key: "workflowId", value: "wf_export_report" },
          { key: "input", value: "{\"format\":\"pdf\"}" },
        ],
      },
    ],
  },
  {
    id: "request-access",
    label: "Request Access",
    category: "Plan & Entitlement",
    icon: "DoorOpen",
    description: "On a locked resource, a 'Request access' button files a request workflow and confirms.",
    trigger: "on_click",
    actions: [
      {
        type: "require_auth",
        config: [
          { key: "mode", value: "open_modal" },
          { key: "authMode", value: "sign_in" },
          { key: "resumeAfterLogin", value: "true" },
        ],
      },
      {
        type: "run_workflow",
        config: [
          { key: "workflowId", value: "wf_access_request" },
          { key: "input", value: "{\"resourceId\":\"{{block.resourceId}}\",\"requestedBy\":\"{{user.email}}\"}" },
        ],
      },
      {
        type: "inline_message",
        config: [
          { key: "message", value: "Access requested. We'll email you when it's approved." },
          { key: "tone", value: "success" },
        ],
      },
    ],
  },
  {
    id: "signout-and-redirect",
    label: "Sign Out & Redirect",
    category: "Auth Action",
    icon: "LogOut",
    description: "A 'Sign out' link ends the session, clears local data, and returns to the homepage.",
    trigger: "on_click",
    actions: [
      {
        type: "logout",
        config: [
          { key: "scope", value: "this_device" },
          { key: "clearLocalState", value: "true" },
          { key: "redirectAfter", value: "page_home" },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "logout" },
          { key: "props", value: "{\"source\":\"account_menu\"}" },
        ],
      },
    ],
  },
  {
    id: "signout-all-devices",
    label: "Sign Out of All Devices",
    category: "Auth Action",
    icon: "ShieldX",
    description: "A security-settings button ends every active session and confirms with a toast.",
    trigger: "on_click",
    actions: [
      {
        type: "logout",
        config: [
          { key: "scope", value: "all_devices" },
          { key: "clearLocalState", value: "true" },
          { key: "redirectAfter", value: "page_login" },
        ],
      },
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Signed out of all devices." },
          { key: "tone", value: "info" },
        ],
      },
    ],
  },
  {
    id: "auth-aware-cta-swap",
    label: "Auth-aware CTA Swap",
    category: "Session State",
    icon: "ToggleRight",
    description: "On page load, show member content and hide the sign-in CTA for authenticated users.",
    trigger: "on_load",
    actions: [
      {
        type: "require_auth",
        config: [
          { key: "mode", value: "inline_message" },
          { key: "resumeAfterLogin", value: "false" },
        ],
      },
      {
        type: "hide_block",
        config: [
          { key: "target", value: "block_signin_cta" },
        ],
      },
      {
        type: "show_block",
        config: [
          { key: "target", value: "block_member_dashboard" },
        ],
      },
    ],
  },
  {
    id: "prompt-signin-on-view",
    label: "Prompt Sign-in on Scroll",
    category: "Auth Entry",
    icon: "Eye",
    description: "When a gated section scrolls into view, gently prompt anonymous visitors to sign in.",
    trigger: "on_view",
    actions: [
      {
        type: "require_auth",
        config: [
          { key: "mode", value: "inline_message" },
          { key: "message", value: "Sign in to read the full article." },
        ],
      },
      {
        type: "track_event",
        config: [
          { key: "event", value: "gate_viewed" },
          { key: "props", value: "{\"gate\":\"article_paywall\"}" },
        ],
      },
    ],
  },
  {
    id: "post-login-welcome",
    label: "Post-login Welcome",
    category: "Session State",
    icon: "PartyPopper",
    description: "After a bound auth call succeeds, welcome the user with a toast and route to onboarding.",
    trigger: "on_success",
    actions: [
      {
        type: "show_toast",
        config: [
          { key: "message", value: "Welcome back, {{user.firstName}}!" },
          { key: "tone", value: "success" },
        ],
      },
      {
        type: "navigate",
        config: [
          { key: "route", value: "page_dashboard" },
        ],
      },
    ],
  },
  {
    id: "auth-error-prompt",
    label: "Auth Error Recovery",
    category: "Session State",
    icon: "AlertTriangle",
    description: "If sign-in fails, show an error and offer the password-reset view.",
    trigger: "on_error",
    actions: [
      {
        type: "inline_message",
        config: [
          { key: "message", value: "That email or password didn't match. Try again or reset your password." },
          { key: "tone", value: "error" },
        ],
      },
      {
        type: "open_auth",
        config: [
          { key: "mode", value: "forgot_password" },
          { key: "presentation", value: "inline" },
        ],
      },
    ],
  },
];

const ACTION_INDEX: Record<string, ActionTypeDef> = Object.fromEntries(
  ACTION_TYPES.map((a) => [a.type, a]),
);

export const actionTypeByKey = (t: string): ActionTypeDef | undefined => ACTION_INDEX[t];

export const RECIPE_CATEGORIES: string[] = Array.from(
  new Set(EVENT_RECIPES.map((r) => r.category)),
);

const newId = (): string => "ev_" + Math.random().toString(36).slice(2, 8);

// Convert a recipe into a live EventHandler, assigning ids and folding each
// action's config array into a Record<string, string>.
export function recipeToHandler(r: EventRecipe): EventHandler {
  const actions: EventAction[] = r.actions.map((a) => {
    const config: Record<string, string> = {};
    for (const c of a.config) config[c.key] = c.value;
    return { id: newId(), type: a.type, config };
  });
  return { id: newId(), trigger: r.trigger, actions };
}
