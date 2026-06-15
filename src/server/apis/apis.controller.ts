// Controller layer — maps HTTP concerns (query parsing, status codes, shapes)
// to service calls. Next.js route handlers delegate here.

import { ApisService, apisService } from "./apis.service";
import type { ApiResult } from "@/server/content/content.controller";
import type { ApiCatalogResponse, HttpMethod } from "./apis.types";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];

export class ApisController {
  constructor(private readonly service: ApisService = apisService) {}

  // GET /api/apis
  list(searchParams: URLSearchParams): ApiResult {
    const methodParam = searchParams.get("method");
    const items = this.service.list({
      method: METHODS.includes(methodParam as HttpMethod)
        ? (methodParam as HttpMethod)
        : undefined,
      search: searchParams.get("search") ?? undefined,
    });

    const body: ApiCatalogResponse = {
      items,
      total: items.length,
      meta: {
        methodBreakdown: this.service.methodBreakdown(),
        resources: this.service.resources(),
      },
    };
    return { status: 200, body };
  }

  // GET /api/apis/:id
  getById(id: string): ApiResult {
    const endpoint = this.service.getById(id);
    if (!endpoint) return { status: 404, body: { error: "Endpoint not found", id } };
    return { status: 200, body: endpoint };
  }
}

export const apisController = new ApisController();
