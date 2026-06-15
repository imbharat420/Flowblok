// Workflow controller — maps HTTP to the service.
import { WorkflowsService, workflowsService } from "./workflows.service";
import type { ApiResult } from "@/server/content/content.controller";

export class WorkflowsController {
  constructor(private readonly service: WorkflowsService = workflowsService) {}

  list(): ApiResult {
    return { status: 200, body: { items: this.service.list() } };
  }

  nodeTypes(): ApiResult {
    return { status: 200, body: { items: this.service.nodeTypes() } };
  }

  getById(id: string): ApiResult {
    const wf = this.service.get(id);
    if (!wf) return { status: 404, body: { error: "Workflow not found", id } };
    return { status: 200, body: wf };
  }
}

export const workflowsController = new WorkflowsController();
