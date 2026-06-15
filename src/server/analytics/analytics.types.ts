// Module-local types for the Analytics dashboards.
// These "dashboard roles" are a presentation concern (which KPI set to show)
// and are intentionally separate from the app-wide RBAC Role union.

export type AnalyticsRole = "ceo" | "cto" | "manager" | "dev";

export interface AnalyticsKpi {
  /** stable key, used for React keys */
  key: string;
  label: string;
  /** preformatted display value (e.g. "$1.24M", "98.6%") */
  value: string;
  /** delta vs previous period, e.g. "+12.4%" */
  delta: string;
  /** true = good/positive movement (green); false = neutral/muted */
  positive: boolean;
  /** lucide icon name, resolved on the client */
  icon: string;
}

export interface BreakdownItem {
  label: string;
  /** raw count for the row (sessions, requests, etc.) */
  value: number;
  /** share of total, 0-100 */
  percent: number;
}

export interface AnalyticsDashboard {
  role: AnalyticsRole;
  roleLabel: string;
  /** one-line framing for this role's view */
  summary: string;
  kpis: AnalyticsKpi[];
  /** last 14 days, oldest → newest */
  traffic: number[];
  topPages: BreakdownItem[];
  sources: BreakdownItem[];
}
