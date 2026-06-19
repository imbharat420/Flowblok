// Workflow service — list, fetch, and node-type catalog. HTTP-agnostic.
import { WorkflowsRepository, workflowsRepository } from "./workflows.repository";
import type { CreateWorkflowInput, NodeType, UpdateWorkflowInput, Workflow } from "@/lib/types";

export class WorkflowsService {
  constructor(private readonly repo: WorkflowsRepository = workflowsRepository) {}

  list(): Array<Pick<Workflow, "id" | "name" | "status" | "lastRun" | "runs"> & { nodeCount: number }> {
    return this.repo.findAll().map((w) => ({
      id: w.id,
      name: w.name,
      status: w.status,
      lastRun: w.lastRun,
      runs: w.runs,
      nodeCount: w.nodes.length,
    }));
  }

  get(id: string): Workflow | null {
    return this.repo.findById(id) ?? null;
  }

  create(input: CreateWorkflowInput): Workflow {
    return this.repo.create(input);
  }

  update(id: string, patch: UpdateWorkflowInput): Workflow | null {
    return this.repo.update(id, patch) ?? null;
  }

  remove(id: string): Workflow | null {
    return this.repo.remove(id) ?? null;
  }

  nodeTypes(): NodeType[] {
    return this.repo.nodeTypes();
  }
}

export const workflowsService = new WorkflowsService();
