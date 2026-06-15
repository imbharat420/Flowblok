// Controller layer — maps HTTP concerns (status codes, shapes) to service calls.
// Next.js route handlers are thin adapters that delegate here.

import { CrmService, crmService } from "./crm.service";
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
}

export const crmController = new CrmController();
