// Service layer — assembles a per-role dashboard from seed data.
// Pure + HTTP-agnostic; reusable from the API route or a server component.

import { AnalyticsRepository, analyticsRepository } from "./analytics.repository";
import type { AnalyticsDashboard, AnalyticsRole } from "./analytics.types";

export const ANALYTICS_ROLES: AnalyticsRole[] = ["ceo", "cto", "manager", "dev"];

export function isAnalyticsRole(v: unknown): v is AnalyticsRole {
  return typeof v === "string" && (ANALYTICS_ROLES as string[]).includes(v);
}

export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository = analyticsRepository) {}

  /** Full dashboard for one role: KPIs + traffic series + shared breakdowns. */
  dashboard(role: AnalyticsRole): AnalyticsDashboard {
    const seed = this.repo.roleSeed(role);
    return {
      role,
      roleLabel: seed.roleLabel,
      summary: seed.summary,
      kpis: seed.kpis,
      traffic: seed.traffic,
      topPages: this.repo.topPages(),
      sources: this.repo.sources(),
    };
  }

  roles(): AnalyticsRole[] {
    return [...ANALYTICS_ROLES];
  }
}

export const analyticsService = new AnalyticsService();
