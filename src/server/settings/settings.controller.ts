// Controller layer — maps HTTP concerns (body parsing, status codes, shapes)
// to service calls. Next.js route handlers are thin adapters that delegate here.

import { SettingsService, settingsService } from "./settings.service";
import type { ApiResult } from "@/server/content/content.controller";

export class SettingsController {
  constructor(private readonly service: SettingsService = settingsService) {}

  // GET /api/settings
  snapshot(): ApiResult {
    return { status: 200, body: this.service.snapshot() };
  }

  // PUT /api/settings/general
  updateGeneral(body: unknown): ApiResult {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid body" } };
    }
    const { name, region } = body as Record<string, unknown>;
    const patch: { name?: string; region?: string } = {};
    if (typeof name === "string" && name.trim()) patch.name = name.trim();
    if (typeof region === "string" && region.trim()) patch.region = region.trim();
    if (Object.keys(patch).length === 0) {
      return { status: 400, body: { error: "Nothing to update" } };
    }
    return { status: 200, body: this.service.updateGeneral(patch) };
  }

  // POST /api/settings/domains
  addDomain(body: unknown): ApiResult {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid body" } };
    }
    const { host } = body as Record<string, unknown>;
    if (typeof host !== "string" || !host.trim()) {
      return { status: 400, body: { error: "A domain host is required" } };
    }
    const created = this.service.addDomain(host);
    if (!created) {
      return { status: 422, body: { error: "Invalid or duplicate domain", host } };
    }
    return { status: 201, body: created };
  }

  // PUT /api/settings/toggles/:id
  setToggle(id: string, body: unknown): ApiResult {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid body" } };
    }
    const { enabled } = body as Record<string, unknown>;
    if (typeof enabled !== "boolean") {
      return { status: 400, body: { error: "`enabled` must be a boolean" } };
    }
    const updated = this.service.setToggle(id, enabled);
    if (!updated) return { status: 404, body: { error: "Toggle not found", id } };
    return { status: 200, body: updated };
  }
}

export const settingsController = new SettingsController();
