"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import type { Space, SpacePlan, SpaceStatus, SpacesStats } from "@/server/spaces/spaces.types";
import {
  Boxes,
  CircleDot,
  Users,
  Layers,
  Plus,
  ExternalLink,
  Copy,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SpacesResponse {
  items: Space[];
  meta: { stats: SpacesStats };
}

const PLAN_TONE: Record<SpacePlan, BadgeTone> = {
  Starter: "neutral",
  Professional: "info",
  Business: "accent",
  Enterprise: "ok",
};

const STATUS_META: Record<SpaceStatus, { tone: BadgeTone; label: string }> = {
  active: { tone: "ok", label: "Active" },
  paused: { tone: "warn", label: "Paused" },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SpacesPage() {
  const [data, setData] = useState<SpacesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Space | null>(null);

  useEffect(() => {
    fetch("/api/spaces")
      .then((r) => r.json())
      .then((d: SpacesResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = data?.meta.stats;

  const columns: Column<Space>[] = [
    {
      key: "name",
      header: "Space",
      render: (s) => (
        <div>
          <span className="font-medium text-fg">{s.name}</span>
          <span className="ml-2 font-mono text-[11px] text-fg-subtle">{s.id}</span>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (s) => <Badge tone={PLAN_TONE[s.plan]}>{s.plan}</Badge>,
    },
    {
      key: "members",
      header: "Members",
      align: "right",
      render: (s) => <span className="nums text-fg-muted">{s.members}</span>,
    },
    {
      key: "region",
      header: "Region",
      render: (s) => <span className="font-mono text-[12px] text-fg-muted">{s.region}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => {
        const m = STATUS_META[s.status];
        return (
          <Badge tone={m.tone} dot>
            {m.label}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      header: "Created",
      align: "right",
      render: (s) => <span className="nums text-[12px] text-fg-subtle">{fmtDate(s.createdAt)}</span>,
    },
  ];

  return (
    <>
      <Topbar title="Spaces" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <PageHeader
            title="Spaces"
            description="Super-admin view — manage every space across the organization."
            actions={
              <Button variant="primary">
                <Plus className="h-3.5 w-3.5" /> New space
              </Button>
            }
          />

          <div className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Super-admin surface — actions affect all tenants.
          </div>

          {/* KPI row */}
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard label="Total spaces" value={stats?.total ?? "—"} icon={Boxes} />
            <KpiCard label="Active" value={stats?.active ?? "—"} icon={CircleDot} />
            <KpiCard label="Total members" value={stats?.totalMembers ?? "—"} icon={Users} />
            <KpiCard label="Plans in use" value={stats?.plansInUse ?? "—"} icon={Layers} />
          </div>

          {/* table */}
          {loading ? (
            <div className="overflow-hidden rounded-lg border border-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b border-border p-4 last:border-0">
                  <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={data?.items ?? []}
              getKey={(s) => s.id}
              onRowClick={(s) => setSelected(s)}
              empty={
                <EmptyState
                  icon={Boxes}
                  title="No spaces yet"
                  description="Create the first space to start managing tenants."
                  action={
                    <Button variant="primary">
                      <Plus className="h-3.5 w-3.5" /> New space
                    </Button>
                  }
                />
              }
            />
          )}

          {!loading && data && (
            <p className="mt-3 text-[12px] text-fg-muted">
              Showing <span className="nums text-fg">{data.items.length}</span> spaces · served by{" "}
              <span className="font-mono text-fg-subtle">GET /api/spaces</span> (controller → service →
              repository)
            </p>
          )}
        </div>
      </main>

      <SpaceDrawer space={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function SpaceDrawer({ space, onClose }: { space: Space | null; onClose: () => void }) {
  return (
    <Drawer
      open={!!space}
      onClose={onClose}
      title={space?.name ?? "Space"}
      footer={
        space && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <ExternalLink className="h-3.5 w-3.5" /> Open
              </Button>
              <Button variant="secondary" size="sm">
                <Copy className="h-3.5 w-3.5" /> Clone
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Button>
            </div>
            <Button variant="danger" size="sm">
              Delete space
            </Button>
          </div>
        )
      }
    >
      {space && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_META[space.status].tone} dot>
              {STATUS_META[space.status].label}
            </Badge>
            <Badge tone={PLAN_TONE[space.plan]}>{space.plan}</Badge>
          </div>

          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
            <p className="label-caps mb-1">Space ID</p>
            <p className="font-mono text-[12px] text-fg">{space.id}</p>
          </div>

          <dl className="space-y-3 text-[13px]">
            <DetailRow label="Plan" value={space.plan} />
            <DetailRow label="Members" value={<span className="nums">{space.members}</span>} />
            <DetailRow label="Region" value={<span className="font-mono text-[12px]">{space.region}</span>} />
            <DetailRow label="Status" value={STATUS_META[space.status].label} />
            <DetailRow label="Created" value={fmtDate(space.createdAt)} />
          </dl>
        </div>
      )}
    </Drawer>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="text-fg">{value}</dd>
    </div>
  );
}
