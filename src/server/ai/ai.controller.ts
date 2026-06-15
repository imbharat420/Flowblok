// Controller layer — maps HTTP concerns to service calls and returns { status, body }.
// Route handlers are thin adapters that delegate here.

import { AiService, aiService } from "./ai.service";
import type { ApiResult } from "@/server/content/content.controller";

export class AiController {
  constructor(private readonly service: AiService = aiService) {}

  // POST /api/ai/generate
  generate(body: unknown): ApiResult {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid body" } };
    }
    const { prompt } = body as Record<string, unknown>;
    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return { status: 400, body: { error: "A non-empty prompt is required" } };
    }

    const plan = this.service.generate(prompt);
    return { status: 200, body: { prompt: plan.prompt, steps: plan.steps } };
  }
}

export const aiController = new AiController();
