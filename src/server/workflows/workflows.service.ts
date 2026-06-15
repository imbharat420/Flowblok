// Workflow service — list, fetch, and node-type catalog. HTTP-agnostic.
import { WorkflowsRepository, workflowsRepository } from "./workflows.repository";
import type { NodeType, Workflow } from "@/lib/types";

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

  nodeTypes(): NodeType[] {
    return this.repo.nodeTypes();
  }
}

export const workflowsService = new WorkflowsService();
