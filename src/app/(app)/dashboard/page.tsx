import { Topbar } from "@/components/app-shell/topbar";
import { KpiCard } from "@/components/ui/kpi-card";
import { spaceService } from "@/server/space/space.service";
import { contentService } from "@/server/content/content.service";
import {
  FileText,
  Database,
  Workflow,
  Webhook,
  Users,
  Shield,
  Sparkles,
  Rocket,
  GitCommitVertical,
  CheckCircle2,
  Pencil,
  PlusCircle,
  Workflow as WorkflowIcon,
} from "lucide-react";

const KIND_ICON = {
  publish: CheckCircle2,
  edit: Pencil,
  create: PlusCircle,
  workflow: WorkflowIcon,
  deploy: Rocket,
} as const;

export default async function DashboardPage() {
  const space = await spaceService.get();
  const activity = spaceService.recentActivity();
  const breakdown = await contentService.statusBreakdown(space.id);
  const c = space.counts;

  const total = (breakdown.draft ?? 0) + (breakdown.review ?? 0) + (breakdown.published ?? 0);
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <>
      <Topbar title="Dashboard" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          {/* heading */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-fg">{space.name}</h1>
              <p className="mt-1 text-[13px] text-fg-muted">
                One space · design, content, data, logic, APIs, CRM, commerce, AI — all in one place.
              </p>
            </div>
            <span className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-fg-muted">
              {space.plan} plan
            </span>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="Pages" value={c.pages} icon={FileText} />
            <KpiCard label="Collections" value={c.collections} icon={Database} />
            <KpiCard label="Workflows" value={c.workflows} icon={Workflow} />
            <KpiCard label="APIs" value={c.apis} icon={Webhook} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="Users" value={c.users} icon={Users} />
            <KpiCard label="Roles" value={c.roles} icon={Shield} />
            <KpiCard label="AI Agents" value={c.aiAgents} icon={Sparkles} />
            <KpiCard label="Deployments" value={c.deployments} icon={Rocket} />
          </div>

          {/* lower split: pipeline + activity */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* content pipeline */}
            <section className="rounded-lg border border-border bg-surface p-5 lg:col-span-1">
              <p className="label-caps">Content pipeline</p>
              <div className="mt-4 space-y-3">
                {(["published", "review", "draft"] as const).map((s) => {
                  const n = breakdown[s] ?? 0;
                  const color =
                    s === "published" ? "bg-ok" : s === "review" ? "bg-warn" : "bg-fg-subtle";
                  return (
                    <div key={s}>
                      <div className="mb-1 flex items-center justify-between text-[12px]">
                        <span className="capitalize text-fg-muted">{s}</span>
                        <span className="nums text-fg">{n}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct(n)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-[12px] text-fg-muted">
                <span className="nums text-fg">{total}</span> stories total across {space.counts.collections} collections.
              </p>
            </section>

            {/* activity stream */}
            <section className="rounded-lg border border-border bg-surface p-5 lg:col-span-2">
              <div className="flex items-center gap-2">
                <GitCommitVertical className="h-4 w-4 text-fg-subtle" />
                <p className="label-caps">Recent activity</p>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {activity.map((ev) => {
                  const Icon = KIND_ICON[ev.kind];
                  return (
                    <li key={ev.id} className="flex items-center gap-3 py-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-2 text-fg-muted">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 text-[13px]">
                        <span className="font-medium text-fg">{ev.actor}</span>{" "}
                        <span className="text-fg-muted">{ev.action}</span>{" "}
                        <span className="text-fg">{ev.target}</span>
                      </span>
                      <time className="nums shrink-0 text-[11px] text-fg-subtle">
                        {new Date(ev.at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
