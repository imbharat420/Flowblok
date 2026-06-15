// Controller layer — thin adapter mapping HTTP concerns to service calls.

import { DatabaseService, databaseService } from "./database.service";
import type { ApiResult } from "@/server/content/content.controller";

export class DatabaseController {
  constructor(private readonly service: DatabaseService = databaseService) {}

  // GET /api/database/tables
  list(): ApiResult {
    return { status: 200, body: { items: this.service.list() } };
  }

  // GET /api/database/tables/:id
  getById(id: string): ApiResult {
    const table = this.service.getById(id);
    if (!table) return { status: 404, body: { error: "Table not found", id } };
    return { status: 200, body: { ...table, endpoints: this.service.endpoints(table) } };
  }
}

export const databaseController = new DatabaseController();
