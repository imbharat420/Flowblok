// Service layer — business logic. Knows nothing about HTTP.
// Turns a free-text prompt into an ordered, deterministic generation plan.

import { AiRepository, aiRepository } from "./ai.repository";
import type { AiAgent, GeneratePlan, GenerationStep } from "./ai.types";

export class AiService {
  constructor(private readonly repo: AiRepository = aiRepository) {}

  /**
   * Produce the ordered step plan for a prompt. The prompt is normalised and
   * echoed back so the caller can confirm what was generated. The plan order is
   * fixed — every build generates all five layers together, then deploys.
   */
  generate(prompt: string): GeneratePlan {
    const cleaned = prompt.trim();
    return {
      prompt: cleaned,
      steps: this.repo.stepPlan(),
    };
  }

  steps(): GenerationStep[] {
    return this.repo.stepPlan();
  }

  agents(): AiAgent[] {
    return this.repo.agents();
  }
}

export const aiService = new AiService();
