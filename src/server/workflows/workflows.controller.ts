// Workflow controller — maps HTTP to the service.
import { WorkflowsService, workflowsService } from "./workflows.service";
import { getActiveSpaceId, getOwnerId } from "@/server/spaces/active-space";
import type { WorkflowOwner } from "./workflows.repository";
import type { ApiResult } from "@/server/content/content.controller";
import type {
  UpdateWorkflowInput,
  WorkflowConnection,
  WorkflowNode,
  WorkflowStatus,
} from "@/lib/types";

const STATUSES: WorkflowStatus[] = ["active", "inactive", "draft"];

async function ownerCtx(): Promise<WorkflowOwner> {
  return { spaceId: await getActiveSpaceId(), ownerId: await getOwnerId() };
}

export class WorkflowsController {
  constructor(private readonly service: WorkflowsService = workflowsService) {}

  async list(): Promise<ApiResult> {
    const spaceId = (await getActiveSpaceId()) ?? "";
    return { status: 200, body: { items: await this.service.list(spaceId) } };
  }

  nodeTypes(): ApiResult {
    return { status: 200, body: { items: this.service.nodeTypes() } };
  }

  presets(): ApiResult {
    return { status: 200, body: { items: this.service.presets() } };
  }

  // POST /api/workflows/presets — instantiate a preset as a new draft workflow.
  async createFromPreset(body: unknown): Promise<ApiResult> {
    if (!body || typeof body !== "object") return { status: 400, body: { error: "Invalid body" } };
    const { presetId, name } = body as Record<string, unknown>;
    if (typeof presetId !== "string" || !presetId) {
      return { status: 400, body: { error: "presetId is required" } };
    }
    const wf = await this.service.createFromPreset(presetId, typeof name === "string" ? name : undefined, await ownerCtx());
    if (!wf) return { status: 404, body: { error: "Preset not found", presetId } };
    return { status: 201, body: wf };
  }

  async getById(id: string): Promise<ApiResult> {
    const wf = await this.service.get(id);
    if (!wf) return { status: 404, body: { error: "Workflow not found", id } };
    return { status: 200, body: wf };
  }

  // POST /api/workflows
  async create(body: unknown): Promise<ApiResult> {
    if (!body || typeof body !== "object") return { status: 400, body: { error: "Invalid body" } };
    const { name } = body as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim()) {
      return { status: 400, body: { error: "Name is required" } };
    }
    return { status: 201, body: await this.service.create({ name: name.trim() }, await ownerCtx()) };
  }

  // PUT /api/workflows/:id
  async update(id: string, body: unknown): Promise<ApiResult> {
    if (!body || typeof body !== "object") return { status: 400, body: { error: "Invalid body" } };
    const b = body as Record<string, unknown>;
    const patch: UpdateWorkflowInput = {};
    if (typeof b.name === "string") patch.name = b.name;
    if (STATUSES.includes(b.status as WorkflowStatus)) patch.status = b.status as WorkflowStatus;
    if (Array.isArray(b.nodes)) patch.nodes = b.nodes as WorkflowNode[];
    if (Array.isArray(b.connections)) patch.connections = b.connections as WorkflowConnection[];

    const updated = await this.service.update(id, patch);
    if (!updated) return { status: 404, body: { error: "Workflow not found", id } };
    return { status: 200, body: updated };
  }

  // DELETE /api/workflows/:id
  async remove(id: string): Promise<ApiResult> {
    const removed = await this.service.remove(id);
    if (!removed) return { status: 404, body: { error: "Workflow not found", id } };
    return { status: 200, body: { ok: true, id } };
  }
}

export const workflowsController = new WorkflowsController();
