// Controller layer — maps HTTP concerns (status codes, shapes) to service calls.
// Next.js route handlers are thin adapters that delegate here.

import { CrmService, crmService } from "./crm.service";
import { DEAL_STAGES } from "./crm.types";
import type { DealStage } from "./crm.types";
import type { ApiResult } from "@/server/content/content.controller";

export class CrmController {
  constructor(private readonly service: CrmService = crmService) {}

  // GET /api/crm/pipeline
  pipeline(): ApiResult {
    return {
      status: 200,
      body: {
        columns: this.service.pipeline(),
        kpis: this.service.kpis(),
      },
    };
  }

  // GET /api/crm/contacts
  contacts(): ApiResult {
    return { status: 200, body: { items: this.service.contacts() } };
  }

  // GET /api/crm/companies
  companies(): ApiResult {
    return { status: 200, body: { items: this.service.companies() } };
  }

  // GET /api/crm/activities
  activities(): ApiResult {
    return { status: 200, body: { items: this.service.activities() } };
  }

  // POST /api/crm/leads
  createLead(body: unknown): ApiResult {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid body" } };
    }
    const { name, company, value } = body as Record<string, unknown>;
    if (typeof name !== "string" || name.trim() === "") {
      return { status: 400, body: { error: "Field \"name\" is required" } };
    }
    const deal = this.service.createLead({
      name: name.trim(),
      company: typeof company === "string" ? company.trim() : "",
      value: typeof value === "number" && Number.isFinite(value) ? value : 0,
    });
    return { status: 201, body: deal };
  }

  // PUT /api/crm/deals/:id
  moveDeal(id: string, body: unknown): ApiResult {
    const stage = (body as Record<string, unknown> | null)?.stage;
    if (typeof stage !== "string" || !DEAL_STAGES.includes(stage as DealStage)) {
      return { status: 400, body: { error: "Invalid stage", stages: DEAL_STAGES } };
    }
    const deal = this.service.moveDeal(id, stage as DealStage);
    if (!deal) return { status: 404, body: { error: "Deal not found", id } };
    return { status: 200, body: deal };
  }
}

export const crmController = new CrmController();
