// Workflow controller — maps HTTP to the service.
import { WorkflowsService, workflowsService } from "./workflows.service";
import type { ApiResult } from "@/server/content/content.controller";
import type {
  UpdateWorkflowInput,
  WorkflowConnection,
  WorkflowNode,
  WorkflowStatus,
} from "@/lib/types";

const STATUSES: WorkflowStatus[] = ["active", "inactive", "draft"];

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

  // POST /api/workflows
  create(body: unknown): ApiResult {
    if (!body || typeof body !== "object") return { status: 400, body: { error: "Invalid body" } };
    const { name } = body as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim()) {
      return { status: 400, body: { error: "Name is required" } };
    }
    return { status: 201, body: this.service.create({ name: name.trim() }) };
  }

  // PUT /api/workflows/:id
  update(id: string, body: unknown): ApiResult {
    if (!body || typeof body !== "object") return { status: 400, body: { error: "Invalid body" } };
    const b = body as Record<string, unknown>;
    const patch: UpdateWorkflowInput = {};
    if (typeof b.name === "string") patch.name = b.name;
    if (STATUSES.includes(b.status as WorkflowStatus)) patch.status = b.status as WorkflowStatus;
    if (Array.isArray(b.nodes)) patch.nodes = b.nodes as WorkflowNode[];
    if (Array.isArray(b.connections)) patch.connections = b.connections as WorkflowConnection[];

    const updated = this.service.update(id, patch);
    if (!updated) return { status: 404, body: { error: "Workflow not found", id } };
    return { status: 200, body: updated };
  }

  // DELETE /api/workflows/:id
  remove(id: string): ApiResult {
    const removed = this.service.remove(id);
    if (!removed) return { status: 404, body: { error: "Workflow not found", id } };
    return { status: 200, body: { ok: true, id } };
  }
}

export const workflowsController = new WorkflowsController();
