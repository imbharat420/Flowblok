// Repository layer — owns its in-memory seed data and nothing else.
// Swap these arrays for a warehouse query without touching the service/controller.

import type { AnalyticsKpi, AnalyticsRole, BreakdownItem } from "./analytics.types";

interface RoleSeed {
  roleLabel: string;
  summary: string;
  kpis: AnalyticsKpi[];
  traffic: number[];
}

// 14-day traffic series per role (oldest → newest). Realistic weekend dips.
const TRAFFIC: Record<AnalyticsRole, number[]> = {
  ceo: [8420, 8910, 9240, 8730, 7180, 6950, 9610, 10240, 10880, 10410, 8990, 8640, 11020, 11760],
  cto: [142, 138, 151, 149, 96, 88, 161, 173, 168, 159, 121, 117, 182, 190],
  manager: [3120, 3340, 3580, 3410, 2680, 2510, 3720, 3960, 4180, 4020, 3290, 3110, 4310, 4520],
  dev: [612, 588, 641, 703, 410, 372, 668, 712, 749, 731, 520, 498, 802, 861],
};

const SEED: Record<AnalyticsRole, RoleSeed> = {
  ceo: {
    roleLabel: "CEO",
    summary: "Company-wide outcomes — revenue, growth and retention at a glance.",
    kpis: [
      { key: "mrr", label: "MRR", value: "$1.24M", delta: "+12.4%", positive: true, icon: "DollarSign" },
      { key: "arr", label: "ARR", value: "$14.9M", delta: "+9.1%", positive: true, icon: "TrendingUp" },
      { key: "customers", label: "Active customers", value: "3,182", delta: "+148", positive: true, icon: "Users" },
      { key: "nrr", label: "Net revenue retention", value: "118%", delta: "+3 pts", positive: true, icon: "Repeat" },
    ],
    traffic: TRAFFIC.ceo,
  },
  cto: {
    roleLabel: "CTO",
    summary: "Platform health — reliability, latency and infrastructure spend.",
    kpis: [
      { key: "uptime", label: "Uptime (30d)", value: "99.98%", delta: "+0.04%", positive: true, icon: "Activity" },
      { key: "p95", label: "API p95 latency", value: "182 ms", delta: "-14 ms", positive: true, icon: "Gauge" },
      { key: "error", label: "Error rate", value: "0.21%", delta: "-0.06%", positive: true, icon: "TriangleAlert" },
      { key: "spend", label: "Cloud spend (mo)", value: "$48.2K", delta: "+4.8%", positive: false, icon: "Server" },
    ],
    traffic: TRAFFIC.cto,
  },
  manager: {
    roleLabel: "Manager",
    summary: "Team throughput — content velocity, engagement and conversion.",
    kpis: [
      { key: "published", label: "Stories published", value: "284", delta: "+31", positive: true, icon: "FileCheck" },
      { key: "engagement", label: "Avg. engagement", value: "4m 12s", delta: "+18s", positive: true, icon: "Clock" },
      { key: "conversion", label: "Conversion rate", value: "3.84%", delta: "+0.31%", positive: true, icon: "Target" },
      { key: "campaigns", label: "Live campaigns", value: "12", delta: "+2", positive: true, icon: "Megaphone" },
    ],
    traffic: TRAFFIC.manager,
  },
  dev: {
    roleLabel: "Developer",
    summary: "Delivery signals — deploys, build health and incident load.",
    kpis: [
      { key: "deploys", label: "Deploys (7d)", value: "47", delta: "+9", positive: true, icon: "Rocket" },
      { key: "build", label: "Build success", value: "96.4%", delta: "+1.2%", positive: true, icon: "CircleCheck" },
      { key: "lead", label: "Lead time", value: "6.2 hrs", delta: "-1.1 hrs", positive: true, icon: "GitPullRequest" },
      { key: "incidents", label: "Open incidents", value: "3", delta: "-2", positive: true, icon: "Bug" },
    ],
    traffic: TRAFFIC.dev,
  },
};

// Shared breakdowns — same across roles (site-wide), WakaTime-style lists.
const TOP_PAGES: BreakdownItem[] = [
  { label: "/", value: 48210, percent: 31 },
  { label: "/pricing", value: 26840, percent: 17 },
  { label: "/blog/headless-cms-guide", value: 19320, percent: 12 },
  { label: "/docs/getting-started", value: 15470, percent: 10 },
  { label: "/features", value: 12880, percent: 8 },
  { label: "/customers", value: 9640, percent: 6 },
  { label: "/changelog", value: 7210, percent: 5 },
  { label: "/contact", value: 5930, percent: 4 },
];

const SOURCES: BreakdownItem[] = [
  { label: "Organic search", value: 71240, percent: 42 },
  { label: "Direct", value: 40690, percent: 24 },
  { label: "Referral", value: 23720, percent: 14 },
  { label: "Social", value: 16950, percent: 10 },
  { label: "Email", value: 11860, percent: 7 },
  { label: "Paid", value: 5080, percent: 3 },
];

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
