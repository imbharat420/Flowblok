// Repository layer — owns its in-memory seed data and nothing else.
// Swap these arrays for a warehouse query without touching the service/controller.

import type { AnalyticsKpi, AnalyticsRole, BreakdownItem } from "./analytics.types";

interface RoleSeed {
  roleLabel: string;
  summary: string;
  kpis: AnalyticsKpi[];
  traffic: number[];
}

// Cleared: no demo analytics. Zeroed 14-day series + zeroed KPIs until real
// events flow in. Role labels/summaries are kept as structural chrome.
const ZERO14 = Array.from({ length: 14 }, () => 0);
const TRAFFIC: Record<AnalyticsRole, number[]> = { ceo: ZERO14, cto: ZERO14, manager: ZERO14, dev: ZERO14 };

const kpi = (key: string, label: string, icon: string): AnalyticsKpi => ({
  key,
  label,
  value: "0",
  delta: "—",
  positive: true,
  icon,
});

const SEED: Record<AnalyticsRole, RoleSeed> = {
  ceo: {
    roleLabel: "CEO",
    summary: "Company-wide outcomes — revenue, growth and retention at a glance.",
    kpis: [kpi("mrr", "MRR", "DollarSign"), kpi("arr", "ARR", "TrendingUp"), kpi("customers", "Active customers", "Users"), kpi("nrr", "Net revenue retention", "Repeat")],
    traffic: TRAFFIC.ceo,
  },
  cto: {
    roleLabel: "CTO",
    summary: "Platform health — reliability, latency and infrastructure spend.",
    kpis: [kpi("uptime", "Uptime (30d)", "Activity"), kpi("p95", "API p95 latency", "Gauge"), kpi("error", "Error rate", "TriangleAlert"), kpi("spend", "Cloud spend (mo)", "Server")],
    traffic: TRAFFIC.cto,
  },
  manager: {
    roleLabel: "Manager",
    summary: "Team throughput — content velocity, engagement and conversion.",
    kpis: [kpi("published", "Stories published", "FileCheck"), kpi("engagement", "Avg. engagement", "Clock"), kpi("conversion", "Conversion rate", "Target"), kpi("campaigns", "Live campaigns", "Megaphone")],
    traffic: TRAFFIC.manager,
  },
  dev: {
    roleLabel: "Developer",
    summary: "Delivery signals — deploys, build health and incident load.",
    kpis: [kpi("deploys", "Deploys (7d)", "Rocket"), kpi("build", "Build success", "CircleCheck"), kpi("lead", "Lead time", "GitPullRequest"), kpi("incidents", "Open incidents", "Bug")],
    traffic: TRAFFIC.dev,
  },
};

const TOP_PAGES: BreakdownItem[] = [];
const SOURCES: BreakdownItem[] = [];

export class AnalyticsRepository {
  roleSeed(role: AnalyticsRole): RoleSeed {
    return SEED[role];
  }

  topPages(): BreakdownItem[] {
    return TOP_PAGES;
  }

  sources(): BreakdownItem[] {
    return SOURCES;
  }
}

export const analyticsRepository = new AnalyticsRepository();
