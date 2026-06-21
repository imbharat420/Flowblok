import { Topbar } from "@/components/app-shell/topbar";
import { workflowsService } from "@/server/workflows/workflows.service";
import { getActiveSpaceId } from "@/server/spaces/active-space";
import { WorkflowsClient } from "./workflows-client";

export default async function WorkflowsPage() {
  const spaceId = (await getActiveSpaceId()) ?? "";
  const workflows = await workflowsService.list(spaceId);

  return (
    <>
      <Topbar title="Workflows" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <WorkflowsClient initial={workflows} />
      </main>
    </>
  );
}
