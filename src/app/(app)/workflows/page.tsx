import { Topbar } from "@/components/app-shell/topbar";
import { workflowsService } from "@/server/workflows/workflows.service";
import { WorkflowsClient } from "./workflows-client";

export default function WorkflowsPage() {
  const workflows = workflowsService.list();

  return (
    <>
      <Topbar title="Workflows" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <WorkflowsClient initial={workflows} />
      </main>
    </>
  );
}
