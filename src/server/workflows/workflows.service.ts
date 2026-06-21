// Workflow service — list, fetch, and node-type catalog. HTTP-agnostic.
import { WorkflowsRepository, workflowsRepository, type WorkflowOwner } from "./workflows.repository";
import type { WorkflowPreset } from "./presets";
import type { CreateWorkflowInput, NodeType, UpdateWorkflowInput, Workflow } from "@/lib/types";

export class WorkflowsService {
  constructor(private readonly repo: WorkflowsRepository = workflowsRepository) {}

  async list(spaceId: string): Promise<Array<Pick<Workflow, "id" | "name" | "status" | "lastRun" | "runs"> & { nodeCount: number }>> {
    const all = spaceId ? await this.repo.findAllForSpace(spaceId) : [];
    return all.map((w) => ({
      id: w.id,
      name: w.name,
      status: w.status,
      lastRun: w.lastRun,
      runs: w.runs,
      nodeCount: w.nodes.length,
    }));
  }

  async get(id: string): Promise<Workflow | null> {
    return (await this.repo.findById(id)) ?? null;
  }

  async create(input: CreateWorkflowInput, owner?: WorkflowOwner): Promise<Workflow> {
    return this.repo.create(input, owner);
  }

  async update(id: string, patch: UpdateWorkflowInput): Promise<Workflow | null> {
    return (await this.repo.update(id, patch)) ?? null;
  }

  async remove(id: string): Promise<Workflow | null> {
    return (await this.repo.remove(id)) ?? null;
  }

  nodeTypes(): NodeType[] {
    return this.repo.nodeTypes();
  }

  presets(): WorkflowPreset[] {
    return this.repo.presets();
  }

  async createFromPreset(presetId: string, name?: string, owner?: WorkflowOwner): Promise<Workflow | null> {
    return (await this.repo.createFromPreset(presetId, name, owner)) ?? null;
  }
}

export const workflowsService = new WorkflowsService();
