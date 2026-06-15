// Controller layer — thin HTTP adapter: parse the role param, default sensibly,
// delegate to the service, return { status, body }.

import { AnalyticsService, analyticsService, isAnalyticsRole } from "./analytics.service";
import type { ApiResult } from "@/server/content/content.controller";

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService = analyticsService) {}

  // GET /api/analytics?role=ceo
  dashboard(searchParams: URLSearchParams): ApiResult {
    const roleParam = searchParams.get("role");
    const role = isAnalyticsRole(roleParam) ? roleParam : "ceo";
    return { status: 200, body: this.service.dashboard(role) };
  }
}

export const analyticsController = new AnalyticsController();
