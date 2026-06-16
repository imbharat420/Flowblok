// Subjects catalog, preview-context personas, and the prebuilt logic preset library.
// Generated from a parallel design pass across 8 frontend scenario families.

import type { LogicOperator, LogicRule, LogicSubject, PreviewContext } from "@/lib/logic";

export interface LogicPreset {
  id: string;
  label: string;
  category: string;
  icon: string; // lucide name
  description: string;
  action: "show" | "hide";
  match: "all" | "any";
  conditions: Array<{ subject: string; operator: LogicOperator; value?: string }>;
}

export function presetToRule(p: LogicPreset): LogicRule {
  return {
    action: p.action,
    match: p.match,
    conditions: p.conditions.map((c, i) => ({ id: `${p.id}-${i}`, ...c })),
  };
}

// ---------------- Subjects (merged + deduped, grouped) ----------------
export const SUBJECTS: LogicSubject[] = [
  // Identity & Session
  { key: "user.isAuthenticated", label: "User is signed in", type: "boolean", group: "Identity & Session", sample: "true" },
  { key: "user.isFirstVisit", label: "First-time visitor", type: "boolean", group: "Identity & Session", sample: "true" },
  { key: "user.isVerified", label: "Email/account verified", type: "boolean", group: "Identity & Session", sample: "false" },
  { key: "user.sessionCount", label: "Total session count", type: "number", group: "Identity & Session", sample: "5" },
  { key: "user.daysSinceSignup", label: "Days since signup", type: "number", group: "Identity & Session", sample: "2" },
  { key: "session.minutesSinceLogin", label: "Minutes since login", type: "number", group: "Identity & Session", sample: "3" },
  { key: "session.minutesIdle", label: "Minutes idle", type: "number", group: "Identity & Session", sample: "20" },
  // Role & Permission
  { key: "user.role", label: "User role", type: "enum", group: "Role & Permission", values: ["guest", "viewer", "user", "editor", "developer", "manager", "admin", "owner"], sample: "user" },
  { key: "user.id", label: "User ID", type: "string", group: "Role & Permission", sample: "usr_self" },
  { key: "resource.ownerId", label: "Resource owner ID", type: "string", group: "Role & Permission", sample: "usr_self" },
  { key: "user.permissions", label: "User permissions", type: "string", group: "Role & Permission", sample: "content.publish" },
  // Plan & Billing
  { key: "user.plan", label: "Plan / tier", type: "enum", group: "Plan & Billing", values: ["free", "starter", "pro", "business", "enterprise"], sample: "free" },
  { key: "user.isTrialing", label: "Is on trial", type: "boolean", group: "Plan & Billing", sample: "true" },
  { key: "user.trialEndsAt", label: "Trial end date", type: "date", group: "Plan & Billing", sample: "2026-06-30" },
  { key: "user.subscriptionStatus", label: "Subscription status", type: "enum", group: "Plan & Billing", values: ["none", "trialing", "active", "past_due", "canceled", "expired"], sample: "active" },
  { key: "user.billingInterval", label: "Billing interval", type: "enum", group: "Plan & Billing", values: ["none", "monthly", "annual"], sample: "monthly" },
  // Device & Viewport
  { key: "device", label: "Device type", type: "enum", group: "Device & Viewport", values: ["mobile", "tablet", "desktop"], sample: "desktop" },
  { key: "viewportWidth", label: "Viewport width (px)", type: "number", group: "Device & Viewport", sample: "1440" },
  { key: "orientation", label: "Screen orientation", type: "enum", group: "Device & Viewport", values: ["portrait", "landscape"], sample: "landscape" },
  { key: "prefersDark", label: "Prefers dark mode", type: "boolean", group: "Appearance & Input", sample: "true" },
  { key: "prefersReducedMotion", label: "Prefers reduced motion", type: "boolean", group: "Appearance & Input", sample: "false" },
  { key: "pointer", label: "Pointer precision", type: "enum", group: "Appearance & Input", values: ["touch", "fine", "none"], sample: "fine" },
  // Marketing & Campaign
  { key: "query.utm_source", label: "UTM source", type: "string", group: "Marketing & Campaign", sample: "newsletter" },
  { key: "query.utm_campaign", label: "UTM campaign", type: "string", group: "Marketing & Campaign", sample: "black_friday" },
  { key: "query.utm_medium", label: "UTM medium", type: "string", group: "Marketing & Campaign", sample: "cpc" },
  { key: "referrer", label: "Referrer URL", type: "string", group: "Marketing & Campaign", sample: "google.com" },
  { key: "experiment.bucket", label: "Experiment bucket", type: "enum", group: "Marketing & Campaign", values: ["A", "B", "C"], sample: "A" },
  { key: "dayOfWeek", label: "Day of week", type: "enum", group: "Marketing & Campaign", values: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], sample: "Wed" },
  { key: "hourOfDay", label: "Hour of day (0-23)", type: "number", group: "Marketing & Campaign", sample: "14" },
  { key: "now", label: "Current date/time", type: "date", group: "Marketing & Campaign", sample: "2026-06-16" },
  // Commerce
  { key: "cart.count", label: "Cart item count", type: "number", group: "Commerce", sample: "2" },
  { key: "cart.total", label: "Cart total", type: "number", group: "Commerce", sample: "149.99" },
  { key: "cart.isAbandoned", label: "Cart abandoned", type: "boolean", group: "Commerce", sample: "false" },
  { key: "order.count", label: "Lifetime orders", type: "number", group: "Commerce", sample: "5" },
  { key: "product.inStock", label: "Product in stock", type: "boolean", group: "Commerce", sample: "true" },
  { key: "product.stockCount", label: "Product stock count", type: "number", group: "Commerce", sample: "4" },
  { key: "recommendations.count", label: "Recommendation count", type: "number", group: "Commerce", sample: "6" },
  { key: "customer.lifetimeValue", label: "Customer lifetime value", type: "number", group: "Loyalty", sample: "820" },
  { key: "customer.loyaltyTier", label: "Loyalty tier", type: "enum", group: "Loyalty", values: ["none", "bronze", "silver", "gold", "platinum"], sample: "gold" },
  { key: "customer.loyaltyPoints", label: "Loyalty points", type: "number", group: "Loyalty", sample: "1250" },
  // Locale & Geo
  { key: "locale", label: "Locale / language", type: "enum", group: "Locale & Geo", values: ["en", "fr", "de", "es", "hi", "ar"], sample: "en" },
  { key: "country", label: "Country (ISO-2)", type: "string", group: "Locale & Geo", sample: "US" },
  { key: "region", label: "Region / bloc", type: "enum", group: "Locale & Geo", values: ["EU", "EEA", "UK", "US", "CA", "APAC", "MENA", "LATAM"], sample: "US" },
  { key: "currency", label: "Currency", type: "enum", group: "Locale & Geo", values: ["USD", "EUR", "GBP", "INR", "AED", "JPY"], sample: "USD" },
  { key: "consent.marketing", label: "Marketing consent", type: "boolean", group: "Consent & Flags", sample: "true" },
  { key: "consent.analytics", label: "Analytics consent", type: "boolean", group: "Consent & Flags", sample: "true" },
  { key: "featureFlag.newCheckout", label: "Feature flag: new checkout", type: "boolean", group: "Consent & Flags", sample: "true" },
  // Data & Content state
  { key: "data.status", label: "Data status", type: "enum", group: "Data & Content", values: ["idle", "loading", "success", "error", "empty"], sample: "success" },
  { key: "data.isLoading", label: "Data is loading", type: "boolean", group: "Data & Content", sample: "false" },
  { key: "data.error", label: "Data error", type: "string", group: "Data & Content", sample: "" },
  { key: "data.count", label: "Resolved record count", type: "number", group: "Data & Content", sample: "12" },
  { key: "data.totalCount", label: "Total record count", type: "number", group: "Data & Content", sample: "248" },
  { key: "data.hasMore", label: "Has more pages", type: "boolean", group: "Data & Content", sample: "true" },
  { key: "data.page", label: "Current page", type: "number", group: "Data & Content", sample: "1" },
  { key: "data.isStale", label: "Data is stale", type: "boolean", group: "Data & Content", sample: "false" },
  { key: "data.field", label: "Bound field value", type: "string", group: "Data & Content", sample: "published" },
  { key: "query.q", label: "Search query", type: "string", group: "Data & Content", sample: "" },
];

export const SUBJECT_GROUPS = [...new Set(SUBJECTS.map((s) => s.group))];
export const subjectByKey = (k: string) => SUBJECTS.find((s) => s.key === k);

// ---------------- Preview context personas ----------------
export const DEFAULT_CONTEXT: PreviewContext = {
  user: { isAuthenticated: true, isFirstVisit: false, isVerified: true, role: "user", plan: "pro", daysSinceSignup: 30, sessionCount: 8, id: "usr_self", isTrialing: false, trialEndsAt: "2026-07-01", subscriptionStatus: "active", billingInterval: "monthly", permissions: "content.read,content.publish" },
  session: { minutesSinceLogin: 10, minutesIdle: 1 },
  resource: { ownerId: "usr_self" },
  device: "desktop", viewportWidth: 1440, orientation: "landscape", prefersDark: true, prefersReducedMotion: false, pointer: "fine",
  locale: "en", country: "US", region: "US", currency: "USD",
  consent: { marketing: true, analytics: true },
  featureFlag: { newCheckout: true },
  cart: { count: 2, total: 149.99, isAbandoned: false },
  order: { count: 5 },
  product: { inStock: true, stockCount: 4 },
  recommendations: { count: 6 },
  customer: { lifetimeValue: 820, loyaltyTier: "gold", loyaltyPoints: 1250 },
  experiment: { bucket: "A" },
  referrer: "google.com",
  dayOfWeek: "Wed", hourOfDay: 14,
  query: { utm_source: "", utm_campaign: "", utm_medium: "", q: "" },
  data: { status: "success", isLoading: false, error: "", count: 12, totalCount: 248, hasMore: true, page: 1, isStale: false, field: "published" },
};

export interface ContextPersona {
  id: string;
  label: string;
  icon: string;
  patch: PreviewContext;
}

export const CONTEXT_PERSONAS: ContextPersona[] = [
  { id: "pro-desktop", label: "Pro member · desktop", icon: "Crown", patch: {} },
  { id: "guest-mobile", label: "Guest · mobile", icon: "Smartphone", patch: { user: { isAuthenticated: false, role: "guest", plan: "free", isFirstVisit: true }, device: "mobile", viewportWidth: 390, orientation: "portrait", pointer: "touch", cart: { count: 0, total: 0, isAbandoned: false }, order: { count: 0 } } },
  { id: "new-free", label: "New free user", icon: "Sparkles", patch: { user: { isAuthenticated: true, role: "user", plan: "free", isFirstVisit: true, isVerified: false, daysSinceSignup: 0, sessionCount: 1, subscriptionStatus: "none" } } },
  { id: "trialing", label: "Trial in progress", icon: "Clock", patch: { user: { isAuthenticated: true, plan: "pro", isTrialing: true, subscriptionStatus: "trialing", trialEndsAt: "now+2d" } } },
  { id: "admin", label: "Admin (staff)", icon: "ShieldCheck", patch: { user: { isAuthenticated: true, role: "admin", plan: "business" } } },
  { id: "eu-no-consent", label: "EU visitor · no consent", icon: "Cookie", patch: { region: "EU", country: "DE", locale: "fr", currency: "EUR", consent: { marketing: false, analytics: false } } },
  { id: "shopper", label: "Shopper · full cart", icon: "ShoppingCart", patch: { cart: { count: 3, total: 240, isAbandoned: false }, order: { count: 2 }, customer: { lifetimeValue: 1200, loyaltyTier: "platinum", loyaltyPoints: 1800 } } },
  { id: "campaign", label: "From campaign (B)", icon: "Megaphone", patch: { query: { utm_source: "newsletter", utm_campaign: "black_friday", utm_medium: "cpc", q: "" }, experiment: { bucket: "B" }, referrer: "facebook.com" } },
  { id: "data-loading", label: "Data: loading", icon: "Loader", patch: { data: { status: "loading", isLoading: true, error: "", count: 0, totalCount: 0, hasMore: false, page: 1, isStale: false, field: "" } } },
  { id: "data-empty", label: "Data: empty", icon: "Inbox", patch: { data: { status: "empty", isLoading: false, error: "", count: 0, totalCount: 0, hasMore: false, page: 1, isStale: false, field: "" }, query: { q: "headphones", utm_source: "", utm_campaign: "", utm_medium: "" } } },
  { id: "data-error", label: "Data: error", icon: "TriangleAlert", patch: { data: { status: "error", isLoading: false, error: "Request timed out", count: 0, totalCount: 0, hasMore: false, page: 1, isStale: false, field: "" } } },
];

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function deepMerge(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = isObj(v) && isObj(base[k]) ? deepMerge(base[k] as Record<string, unknown>, v) : v;
  }
  return out;
}
export function contextFor(personaId: string): PreviewContext {
  const p = CONTEXT_PERSONAS.find((x) => x.id === personaId);
  return p ? deepMerge(DEFAULT_CONTEXT, p.patch) : DEFAULT_CONTEXT;
}

// ---------------- Preset library ----------------
export const LOGIC_PRESETS: LogicPreset[] = [
  // Identity & Session
  { id: "members-only", label: "Members only", category: "Identity & Session", icon: "Lock", description: "Show only to signed-in users.", action: "show", match: "all", conditions: [{ subject: "user.isAuthenticated", operator: "truthy" }] },
  { id: "guests-only", label: "Guests only", category: "Identity & Session", icon: "User", description: "Show only to anonymous visitors.", action: "show", match: "all", conditions: [{ subject: "user.isAuthenticated", operator: "falsy" }] },
  { id: "hide-from-members", label: "Hide from members", category: "Identity & Session", icon: "EyeOff", description: "Hide from signed-in users (e.g. a sign-up banner).", action: "hide", match: "all", conditions: [{ subject: "user.isAuthenticated", operator: "truthy" }] },
  { id: "first-time-visitor", label: "First-time visitor", category: "Identity & Session", icon: "Sparkles", description: "Show only on a visitor's first visit.", action: "show", match: "all", conditions: [{ subject: "user.isFirstVisit", operator: "truthy" }] },
  { id: "returning-guest", label: "Returning visitor", category: "Identity & Session", icon: "Eye", description: "Welcome-back prompt for returning anonymous visitors.", action: "show", match: "all", conditions: [{ subject: "user.isFirstVisit", operator: "falsy" }, { subject: "user.isAuthenticated", operator: "falsy" }] },
  { id: "loyal-visitor", label: "Loyal returning visitor", category: "Identity & Session", icon: "Star", description: "Show to visitors who have returned 5+ times.", action: "show", match: "all", conditions: [{ subject: "user.sessionCount", operator: "gte", value: "5" }] },
  { id: "verify-email", label: "Signed up, not verified", category: "Identity & Session", icon: "ShieldCheck", description: "Verify-email reminder for unverified accounts.", action: "show", match: "all", conditions: [{ subject: "user.isAuthenticated", operator: "truthy" }, { subject: "user.isVerified", operator: "falsy" }] },
  { id: "verified-only", label: "Verified members only", category: "Identity & Session", icon: "ShieldCheck", description: "Gated content for verified accounts only.", action: "show", match: "all", conditions: [{ subject: "user.isAuthenticated", operator: "truthy" }, { subject: "user.isVerified", operator: "truthy" }] },
  { id: "new-user-onboarding", label: "New user onboarding", category: "Identity & Session", icon: "Gift", description: "Onboarding tips in the first week after signup.", action: "show", match: "all", conditions: [{ subject: "user.isAuthenticated", operator: "truthy" }, { subject: "user.daysSinceSignup", operator: "lte", value: "7" }] },
  { id: "idle-session-warning", label: "Idle session warning", category: "Identity & Session", icon: "Clock", description: "'Still there?' warning after 15 min idle.", action: "show", match: "all", conditions: [{ subject: "user.isAuthenticated", operator: "truthy" }, { subject: "session.minutesIdle", operator: "gte", value: "15" }] },

  // Role & Permission
  { id: "staff-only", label: "Staff only", category: "Role & Permission", icon: "ShieldCheck", description: "Internal content for staff roles.", action: "show", match: "all", conditions: [{ subject: "user.role", operator: "in", value: "editor,developer,manager,admin,owner" }] },
  { id: "admins-only", label: "Admins only", category: "Role & Permission", icon: "ShieldCheck", description: "Admins and owners only.", action: "show", match: "all", conditions: [{ subject: "user.role", operator: "in", value: "admin,owner" }] },
  { id: "owner-only", label: "Owner only", category: "Role & Permission", icon: "Crown", description: "Workspace owner only.", action: "show", match: "all", conditions: [{ subject: "user.role", operator: "eq", value: "owner" }] },
  { id: "managers-and-above", label: "Managers and above", category: "Role & Permission", icon: "Users", description: "Leadership tier (manager/admin/owner).", action: "show", match: "all", conditions: [{ subject: "user.role", operator: "in", value: "manager,admin,owner" }] },
  { id: "hide-from-viewers", label: "Hide from viewers", category: "Role & Permission", icon: "EyeOff", description: "Hide controls from read-only viewers & guests.", action: "hide", match: "any", conditions: [{ subject: "user.role", operator: "in", value: "guest,viewer" }] },
  { id: "resource-owner-only", label: "Resource owner only", category: "Role & Permission", icon: "Crown", description: "Only the user who owns this record.", action: "show", match: "all", conditions: [{ subject: "user.id", operator: "eq", value: "resource.ownerId" }] },
  { id: "owner-or-admin", label: "Owner or admin", category: "Role & Permission", icon: "ShieldCheck", description: "The resource owner OR any admin.", action: "show", match: "any", conditions: [{ subject: "user.id", operator: "eq", value: "resource.ownerId" }, { subject: "user.role", operator: "in", value: "admin,owner" }] },
  { id: "has-publish-permission", label: "Has publish permission", category: "Role & Permission", icon: "ShieldCheck", description: "Users granted content.publish, regardless of role.", action: "show", match: "all", conditions: [{ subject: "user.permissions", operator: "contains", value: "content.publish" }] },

  // Plan & Monetization
  { id: "free-tier-upsell", label: "Upgrade CTA for Free", category: "Plan & Monetization", icon: "Sparkles", description: "Upgrade CTA shown only to Free-tier users.", action: "show", match: "all", conditions: [{ subject: "user.plan", operator: "eq", value: "free" }] },
  { id: "paywall", label: "Paywall (non-paying)", category: "Plan & Monetization", icon: "Lock", description: "Paywall for logged-out or Free users.", action: "show", match: "any", conditions: [{ subject: "user.isAuthenticated", operator: "falsy" }, { subject: "user.plan", operator: "eq", value: "free" }] },
  { id: "subscriber-only", label: "Subscriber-only content", category: "Plan & Monetization", icon: "Crown", description: "Premium content for active Pro+ subscribers.", action: "show", match: "all", conditions: [{ subject: "user.plan", operator: "in", value: "pro,business,enterprise" }, { subject: "user.subscriptionStatus", operator: "eq", value: "active" }] },
  { id: "hide-upsell-from-paid", label: "Hide upsell from paid", category: "Plan & Monetization", icon: "EyeOff", description: "Don't nag paying customers with upgrade banners.", action: "hide", match: "all", conditions: [{ subject: "user.plan", operator: "nin", value: "free,starter" }] },
  { id: "pro-feature-gate", label: "Gate a Pro+ feature", category: "Plan & Monetization", icon: "ShieldCheck", description: "Feature shown to Pro/Business/Enterprise only.", action: "show", match: "all", conditions: [{ subject: "user.plan", operator: "in", value: "pro,business,enterprise" }] },
  { id: "enterprise-exclusive", label: "Enterprise-exclusive", category: "Plan & Monetization", icon: "Building2", description: "Reserved strictly for Enterprise accounts.", action: "show", match: "all", conditions: [{ subject: "user.plan", operator: "eq", value: "enterprise" }] },
  { id: "trial-banner", label: "Trial-in-progress banner", category: "Plan & Monetization", icon: "Clock", description: "'You're on a free trial' banner.", action: "show", match: "all", conditions: [{ subject: "user.isTrialing", operator: "truthy" }] },
  { id: "trial-ending", label: "Trial ending soon", category: "Plan & Monetization", icon: "Megaphone", description: "Add-payment nudge when trial ends within 3 days.", action: "show", match: "all", conditions: [{ subject: "user.isTrialing", operator: "truthy" }, { subject: "user.trialEndsAt", operator: "between", value: "now..now+3d" }] },
  { id: "win-back", label: "Win-back (canceled)", category: "Plan & Monetization", icon: "Gift", description: "Comeback offer for canceled/expired subscriptions.", action: "show", match: "any", conditions: [{ subject: "user.subscriptionStatus", operator: "eq", value: "canceled" }, { subject: "user.subscriptionStatus", operator: "eq", value: "expired" }] },
  { id: "past-due-warning", label: "Payment failed warning", category: "Plan & Monetization", icon: "TriangleAlert", description: "'Update payment method' alert when past due.", action: "show", match: "all", conditions: [{ subject: "user.subscriptionStatus", operator: "eq", value: "past_due" }] },
  { id: "annual-upsell", label: "Upsell monthly → annual", category: "Plan & Monetization", icon: "Percent", description: "'Save with annual' offer for monthly subscribers.", action: "show", match: "all", conditions: [{ subject: "user.subscriptionStatus", operator: "eq", value: "active" }, { subject: "user.billingInterval", operator: "eq", value: "monthly" }] },

  // Device & Responsive
  { id: "mobile-only", label: "Mobile only", category: "Device & Responsive", icon: "Smartphone", description: "Show only on mobile screens.", action: "show", match: "all", conditions: [{ subject: "device", operator: "eq", value: "mobile" }] },
  { id: "desktop-only", label: "Desktop only", category: "Device & Responsive", icon: "Monitor", description: "Show only on desktop screens.", action: "show", match: "all", conditions: [{ subject: "device", operator: "eq", value: "desktop" }] },
  { id: "tablet-only", label: "Tablet only", category: "Device & Responsive", icon: "Tablet", description: "Show only on tablet screens.", action: "show", match: "all", conditions: [{ subject: "device", operator: "eq", value: "tablet" }] },
  { id: "tablet-and-up", label: "Tablet and up", category: "Device & Responsive", icon: "Tablet", description: "Show on tablet & desktop, hide on phones.", action: "show", match: "any", conditions: [{ subject: "device", operator: "in", value: "tablet,desktop" }] },
  { id: "hide-on-mobile", label: "Hide on mobile", category: "Device & Responsive", icon: "EyeOff", description: "Hide on phones; keep on tablet/desktop.", action: "hide", match: "all", conditions: [{ subject: "device", operator: "eq", value: "mobile" }] },
  { id: "handheld-only", label: "Handheld only", category: "Device & Responsive", icon: "Smartphone", description: "Show only on phones and tablets.", action: "show", match: "any", conditions: [{ subject: "device", operator: "in", value: "mobile,tablet" }] },
  { id: "wide-desktop-only", label: "Wide desktop only", category: "Device & Responsive", icon: "Monitor", description: "Desktop viewports ≥ 1280px wide.", action: "show", match: "all", conditions: [{ subject: "device", operator: "eq", value: "desktop" }, { subject: "viewportWidth", operator: "gte", value: "1280" }] },
  { id: "dark-mode-variant", label: "Dark mode variant", category: "Device & Responsive", icon: "Eye", description: "Show only when system is in dark mode.", action: "show", match: "all", conditions: [{ subject: "prefersDark", operator: "truthy" }] },
  { id: "light-mode-variant", label: "Light mode variant", category: "Device & Responsive", icon: "Eye", description: "Show only when system is in light mode.", action: "show", match: "all", conditions: [{ subject: "prefersDark", operator: "falsy" }] },
  { id: "reduced-motion-fallback", label: "Reduced-motion fallback", category: "Device & Responsive", icon: "Sparkles", description: "Static fallback for reduced-motion visitors.", action: "show", match: "all", conditions: [{ subject: "prefersReducedMotion", operator: "truthy" }] },
  { id: "hide-anim-reduced-motion", label: "Hide animation (reduced motion)", category: "Device & Responsive", icon: "EyeOff", description: "Hide animated block for reduced-motion visitors.", action: "hide", match: "all", conditions: [{ subject: "prefersReducedMotion", operator: "truthy" }] },
  { id: "touch-only", label: "Touch devices only", category: "Device & Responsive", icon: "Smartphone", description: "Show where the primary input is touch.", action: "show", match: "all", conditions: [{ subject: "pointer", operator: "eq", value: "touch" }] },
  { id: "pointer-only", label: "Mouse / pointer only", category: "Device & Responsive", icon: "Monitor", description: "Show only where a precise pointer is available.", action: "show", match: "all", conditions: [{ subject: "pointer", operator: "eq", value: "fine" }] },
  { id: "landscape-only", label: "Landscape only", category: "Device & Responsive", icon: "Tablet", description: "Show only in landscape orientation.", action: "show", match: "all", conditions: [{ subject: "orientation", operator: "eq", value: "landscape" }] },

  // Marketing, Campaign & A/B (authored)
  { id: "from-campaign", label: "From any campaign", category: "Marketing & Campaign", icon: "Megaphone", description: "Show to visitors arriving with a UTM source.", action: "show", match: "all", conditions: [{ subject: "query.utm_source", operator: "exists" }] },
  { id: "specific-campaign", label: "Specific campaign", category: "Marketing & Campaign", icon: "Flag", description: "Show only for a named campaign (e.g. black_friday).", action: "show", match: "all", conditions: [{ subject: "query.utm_campaign", operator: "eq", value: "black_friday" }] },
  { id: "paid-traffic", label: "Paid ads traffic", category: "Marketing & Campaign", icon: "Megaphone", description: "Show only to paid/cpc/ppc visitors.", action: "show", match: "any", conditions: [{ subject: "query.utm_medium", operator: "in", value: "cpc,paid,ppc" }] },
  { id: "organic-only", label: "Hide from campaign traffic", category: "Marketing & Campaign", icon: "EyeOff", description: "Hide from anyone arriving via a UTM campaign.", action: "hide", match: "all", conditions: [{ subject: "query.utm_source", operator: "exists" }] },
  { id: "social-referral", label: "From social referral", category: "Marketing & Campaign", icon: "Flag", description: "Show to visitors referred from a social network.", action: "show", match: "any", conditions: [{ subject: "referrer", operator: "contains", value: "facebook" }] },
  { id: "ab-variant-a", label: "A/B · Variant A", category: "Marketing & Campaign", icon: "FlaskConical", description: "Show only to experiment bucket A.", action: "show", match: "all", conditions: [{ subject: "experiment.bucket", operator: "eq", value: "A" }] },
  { id: "ab-variant-b", label: "A/B · Variant B", category: "Marketing & Campaign", icon: "FlaskConical", description: "Show only to experiment bucket B.", action: "show", match: "all", conditions: [{ subject: "experiment.bucket", operator: "eq", value: "B" }] },
  { id: "ab-variant-c", label: "A/B · Variant C", category: "Marketing & Campaign", icon: "FlaskConical", description: "Show only to experiment bucket C.", action: "show", match: "all", conditions: [{ subject: "experiment.bucket", operator: "eq", value: "C" }] },
  { id: "scheduled-window", label: "Scheduled window", category: "Marketing & Campaign", icon: "Calendar", description: "Show only between two dates (e.g. a sale).", action: "show", match: "all", conditions: [{ subject: "now", operator: "between", value: "2026-11-25..2026-12-02" }] },
  { id: "flash-sale", label: "Flash sale (next 2 days)", category: "Marketing & Campaign", icon: "Clock", description: "Show only for the next 48 hours.", action: "show", match: "all", conditions: [{ subject: "now", operator: "between", value: "now..now+2d" }] },
  { id: "launch-from", label: "Live from a date", category: "Marketing & Campaign", icon: "Calendar", description: "Show only on/after a launch date.", action: "show", match: "all", conditions: [{ subject: "now", operator: "gte", value: "2026-07-01" }] },
  { id: "expires-on", label: "Hide after expiry", category: "Marketing & Campaign", icon: "Calendar", description: "Hide on/after an expiry date.", action: "hide", match: "all", conditions: [{ subject: "now", operator: "gte", value: "2026-12-31" }] },
  { id: "weekend-only", label: "Weekend only", category: "Marketing & Campaign", icon: "Calendar", description: "Show only on Saturday and Sunday.", action: "show", match: "any", conditions: [{ subject: "dayOfWeek", operator: "in", value: "Sat,Sun" }] },
  { id: "business-hours", label: "Business hours only", category: "Marketing & Campaign", icon: "Clock", description: "Show only between 9:00 and 17:00.", action: "show", match: "all", conditions: [{ subject: "hourOfDay", operator: "between", value: "9..17" }] },

  // Commerce & Personalization
  { id: "empty-cart", label: "Empty cart only", category: "Commerce", icon: "ShoppingCart", description: "Show when the cart is empty.", action: "show", match: "all", conditions: [{ subject: "cart.count", operator: "eq", value: "0" }] },
  { id: "non-empty-cart", label: "Cart has items", category: "Commerce", icon: "ShoppingCart", description: "Show when there is at least one item.", action: "show", match: "all", conditions: [{ subject: "cart.count", operator: "gt", value: "0" }] },
  { id: "high-value-cart", label: "High-value cart", category: "Commerce", icon: "Crown", description: "Show when cart total ≥ a premium threshold.", action: "show", match: "all", conditions: [{ subject: "cart.total", operator: "gte", value: "200" }] },
  { id: "free-shipping-gap", label: "Almost free shipping", category: "Commerce", icon: "Percent", description: "Nudge when just below the free-shipping threshold.", action: "show", match: "all", conditions: [{ subject: "cart.total", operator: "between", value: "35..50" }] },
  { id: "abandoned-cart", label: "Abandoned cart recovery", category: "Commerce", icon: "Clock", description: "Show recovery message when cart is abandoned.", action: "show", match: "all", conditions: [{ subject: "cart.isAbandoned", operator: "truthy" }] },
  { id: "returning-buyer", label: "Returning buyer", category: "Commerce", icon: "Star", description: "Show to customers with ≥1 past order.", action: "show", match: "all", conditions: [{ subject: "order.count", operator: "gte", value: "1" }] },
  { id: "first-time-shopper", label: "First-time shopper", category: "Commerce", icon: "Gift", description: "First-purchase incentive for shoppers with no orders.", action: "show", match: "all", conditions: [{ subject: "order.count", operator: "eq", value: "0" }, { subject: "user.isAuthenticated", operator: "truthy" }] },
  { id: "vip-customer", label: "VIP high-value customer", category: "Commerce", icon: "Crown", description: "Exclusive perks for high lifetime-value customers.", action: "show", match: "all", conditions: [{ subject: "customer.lifetimeValue", operator: "gte", value: "1000" }] },
  { id: "loyalty-gold-plus", label: "Gold & Platinum loyalty", category: "Commerce", icon: "ShieldCheck", description: "Premium content for Gold/Platinum members.", action: "show", match: "any", conditions: [{ subject: "customer.loyaltyTier", operator: "in", value: "gold,platinum" }] },
  { id: "redeemable-points", label: "Has redeemable points", category: "Commerce", icon: "Gift", description: "'Redeem your points' when balance ≥ 500.", action: "show", match: "all", conditions: [{ subject: "customer.loyaltyPoints", operator: "gte", value: "500" }] },
  { id: "product-in-stock", label: "Product in stock", category: "Commerce", icon: "ShoppingCart", description: "Show add-to-cart only when purchasable.", action: "show", match: "all", conditions: [{ subject: "product.inStock", operator: "truthy" }] },
  { id: "out-of-stock", label: "Out-of-stock notice", category: "Commerce", icon: "EyeOff", description: "Show 'notify me' only when unavailable.", action: "show", match: "all", conditions: [{ subject: "product.inStock", operator: "falsy" }] },
  { id: "low-stock-urgency", label: "Low-stock urgency", category: "Commerce", icon: "Flag", description: "'Only a few left' when stock is 1-5.", action: "show", match: "all", conditions: [{ subject: "product.stockCount", operator: "between", value: "1..5" }] },
  { id: "has-recommendations", label: "Recommendations available", category: "Commerce", icon: "Sparkles", description: "Show the recommendations carousel when present.", action: "show", match: "all", conditions: [{ subject: "recommendations.count", operator: "gt", value: "0" }] },

  // Locale, Geo & Consent
  { id: "eu-visitors", label: "EU visitors only", category: "Locale & Geo", icon: "MapPin", description: "Show only to visitors in the EU.", action: "show", match: "all", conditions: [{ subject: "region", operator: "eq", value: "EU" }] },
  { id: "hide-from-eu", label: "Hide from EU/EEA", category: "Locale & Geo", icon: "Globe", description: "Hide from EU/EEA visitors (compliance).", action: "hide", match: "any", conditions: [{ subject: "region", operator: "in", value: "EU,EEA" }] },
  { id: "selected-countries", label: "Selected countries", category: "Locale & Geo", icon: "Flag", description: "Show only to an allow-list of countries.", action: "show", match: "all", conditions: [{ subject: "country", operator: "in", value: "US,GB,CA" }] },
  { id: "language-french", label: "French only", category: "Locale & Geo", icon: "Languages", description: "Show only when the locale is French.", action: "show", match: "all", conditions: [{ subject: "locale", operator: "eq", value: "fr" }] },
  { id: "selected-languages", label: "Selected languages", category: "Locale & Geo", icon: "Languages", description: "Show only for a chosen set of locales.", action: "show", match: "any", conditions: [{ subject: "locale", operator: "in", value: "en,es" }] },
  { id: "rtl-arabic", label: "Arabic (RTL) only", category: "Locale & Geo", icon: "Globe", description: "Show RTL content only for Arabic.", action: "show", match: "all", conditions: [{ subject: "locale", operator: "eq", value: "ar" }] },
  { id: "with-marketing-consent", label: "With marketing consent", category: "Locale & Geo", icon: "Cookie", description: "Show ad/marketing content only after consent.", action: "show", match: "all", conditions: [{ subject: "consent.marketing", operator: "truthy" }] },
  { id: "hide-until-consent", label: "Hide until marketing consent", category: "Locale & Geo", icon: "EyeOff", description: "Hide trackers/pixels until consent is given.", action: "hide", match: "all", conditions: [{ subject: "consent.marketing", operator: "falsy" }] },
  { id: "eu-consent-prompt", label: "EU consent prompt", category: "Locale & Geo", icon: "Cookie", description: "GDPR prompt for EU visitors without consent yet.", action: "show", match: "all", conditions: [{ subject: "region", operator: "eq", value: "EU" }, { subject: "consent.marketing", operator: "falsy" }] },
  { id: "feature-flag-on", label: "Feature flag ON", category: "Locale & Geo", icon: "ToggleRight", description: "Show only when a named feature flag is enabled.", action: "show", match: "all", conditions: [{ subject: "featureFlag.newCheckout", operator: "truthy" }] },
  { id: "feature-flag-off", label: "Feature flag OFF", category: "Locale & Geo", icon: "EyeOff", description: "Hide when a feature flag is disabled.", action: "hide", match: "all", conditions: [{ subject: "featureFlag.newCheckout", operator: "falsy" }] },

  // Data & Content state
  { id: "show-while-loading", label: "Show while loading", category: "Data & Content", icon: "Loader", description: "Skeleton/spinner only while data loads.", action: "show", match: "all", conditions: [{ subject: "data.status", operator: "eq", value: "loading" }] },
  { id: "hide-until-loaded", label: "Hide until loaded", category: "Data & Content", icon: "EyeOff", description: "Hide until data finishes loading.", action: "hide", match: "all", conditions: [{ subject: "data.isLoading", operator: "truthy" }] },
  { id: "show-on-error", label: "Show on load error", category: "Data & Content", icon: "TriangleAlert", description: "Fallback/retry block when data fails.", action: "show", match: "any", conditions: [{ subject: "data.status", operator: "eq", value: "error" }, { subject: "data.error", operator: "exists" }] },
  { id: "show-empty-state", label: "Show empty state", category: "Data & Content", icon: "Inbox", description: "Empty-state message when 0 records.", action: "show", match: "any", conditions: [{ subject: "data.status", operator: "eq", value: "empty" }, { subject: "data.count", operator: "eq", value: "0" }] },
  { id: "show-when-data", label: "Show when data exists", category: "Data & Content", icon: "List", description: "Render list/grid only with ≥1 record.", action: "show", match: "all", conditions: [{ subject: "data.status", operator: "eq", value: "success" }, { subject: "data.count", operator: "gt", value: "0" }] },
  { id: "no-search-results", label: "No search results", category: "Data & Content", icon: "SearchX", description: "'No results' when searching with 0 matches.", action: "show", match: "all", conditions: [{ subject: "query.q", operator: "exists" }, { subject: "data.count", operator: "eq", value: "0" }] },
  { id: "show-load-more", label: "Show 'Load more'", category: "Data & Content", icon: "ChevronDown", description: "Pagination control when more pages exist.", action: "show", match: "all", conditions: [{ subject: "data.hasMore", operator: "truthy" }] },
  { id: "hide-load-more-end", label: "Hide 'Load more' at end", category: "Data & Content", icon: "CheckCheck", description: "Hide pagination once the last page is reached.", action: "hide", match: "all", conditions: [{ subject: "data.hasMore", operator: "falsy" }] },
  { id: "large-collection", label: "Show on large collection", category: "Data & Content", icon: "LayoutGrid", description: "Reveal a filter bar when total ≥ 10.", action: "show", match: "all", conditions: [{ subject: "data.totalCount", operator: "gte", value: "10" }] },
  { id: "field-value", label: "Show by field value", category: "Data & Content", icon: "Tag", description: "Render when bound field equals a value.", action: "show", match: "all", conditions: [{ subject: "data.field", operator: "eq", value: "published" }] },
  { id: "stale-hint", label: "Show stale-data hint", category: "Data & Content", icon: "RefreshCw", description: "'Refreshing…' hint when data is stale.", action: "show", match: "all", conditions: [{ subject: "data.isStale", operator: "truthy" }, { subject: "data.status", operator: "eq", value: "success" }] },
];

export const PRESET_CATEGORIES = [...new Set(LOGIC_PRESETS.map((p) => p.category))];
