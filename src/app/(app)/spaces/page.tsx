"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { useSpaces } from "@/lib/space-context";
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
  RotateCcw,
  Archive,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function daysLeft(purgeAt?: string | null): number {
  if (!purgeAt) return 0;
  return Math.max(0, Math.ceil((Date.parse(purgeAt) - Date.now()) / 86400000));
}

export default function SpacesPage() {
  const { refresh: refreshContext } = useSpaces();
  const [view, setView] = useState<"active" | "archived">("active");

  // Honor ?view=archived (e.g. after archiving from Settings) without forcing a Suspense boundary.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("view") === "archived") setView("archived");
  }, []);
  const [data, setData] = useState<SpacesResponse | null>(null);
  const [archived, setArchived] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Space | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [a, arc] = await Promise.all([
      fetch("/api/spaces").then((r) => r.json()),
      fetch("/api/spaces/archived").then((r) => r.json()),
    ]);
    setData(a);
    setArchived(arc.items ?? []);
    setLoading(false);
    refreshContext();
  }, [refreshContext]);

  useEffect(() => {
    reload();
  }, [reload]);

  const archive = async (id: string) => {
    setBusyId(id);
    await fetch(`/api/spaces/${id}/archive`, { method: "POST" });
    setBusyId(null);
    setSelected(null);
    await reload();
  };
  const restore = async (id: string) => {
    setBusyId(id);
    await fetch(`/api/spaces/${id}/restore`, { method: "POST" });
    setBusyId(null);
    await reload();
  };

  const stats = data?.meta.stats;

  const activeColumns: Column<Space>[] = [
    { key: "name", header: "Space", render: (s) => (
      <div><span className="font-medium text-fg">{s.name}</span><span className="ml-2 font-mono text-[11px] text-fg-subtle">{s.id}</span></div>
    ) },
    { key: "plan", header: "Plan", render: (s) => <Badge tone={PLAN_TONE[s.plan]}>{s.plan}</Badge> },
    { key: "members", header: "Members", align: "right", render: (s) => <span className="nums text-fg-muted">{s.members}</span> },
    { key: "region", header: "Region", render: (s) => <span className="font-mono text-[12px] text-fg-muted">{s.region}</span> },
    { key: "status", header: "Status", render: (s) => { const m = STATUS_META[s.status]; return <Badge tone={m.tone} dot>{m.label}</Badge>; } },
    { key: "createdAt", header: "Created", align: "right", render: (s) => <span className="nums text-[12px] text-fg-subtle">{fmtDate(s.createdAt)}</span> },
  ];

  const archivedColumns: Column<Space>[] = [
    { key: "name", header: "Space", render: (s) => (
      <div><span className="font-medium text-fg">{s.name}</span><span className="ml-2 font-mono text-[11px] text-fg-subtle">{s.id}</span></div>
    ) },
    { key: "plan", header: "Plan", render: (s) => <Badge tone={PLAN_TONE[s.plan]}>{s.plan}</Badge> },
    { key: "archivedAt", header: "Archived", render: (s) => <span className="nums text-[12px] text-fg-muted">{s.archivedAt ? fmtDate(s.archivedAt) : "—"}</span> },
    { key: "purgeAt", header: "Auto-deletes in", render: (s) => {
      const d = daysLeft(s.purgeAt);
      return <Badge tone={d <= 7 ? "err" : "warn"} dot>{d} day{d === 1 ? "" : "s"}</Badge>;
    } },
    { key: "restore", header: "", align: "right", render: (s) => (
      <Button variant="secondary" size="sm" disabled={busyId === s.id} onClick={() => restore(s.id)}>
        {busyId === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />} Restore
      </Button>
    ) },
  ];

  return (
    <>
      <Topbar title="Spaces" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <PageHeader
            title="Spaces"
            description="Super-admin view — manage every space across the organization."
            actions={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> New space</Button>}
          />

          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5">
              {(["active", "archived"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn("flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] font-medium capitalize", view === v ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg")}
                >
                  {v === "archived" && <Archive className="h-3.5 w-3.5" />}
                  {v}
                  {v === "archived" && archived.length > 0 && <span className="nums ml-0.5 text-fg-subtle">({archived.length})</span>}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] text-fg-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Super-admin surface
            </div>
          </div>

          {view === "active" ? (
            <>
              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard label="Total spaces" value={stats?.total ?? "—"} icon={Boxes} />
                <KpiCard label="Active" value={stats?.active ?? "—"} icon={CircleDot} />
                <KpiCard label="Total members" value={stats?.totalMembers ?? "—"} icon={Users} />
                <KpiCard label="Plans in use" value={stats?.plansInUse ?? "—"} icon={Layers} />
              </div>
              {loading ? (
                <SkeletonTable />
              ) : (
                <DataTable
                  columns={activeColumns}
                  rows={data?.items ?? []}
                  getKey={(s) => s.id}
                  onRowClick={(s) => setSelected(s)}
                  empty={<EmptyState icon={Boxes} title="No spaces yet" description="Create the first space to start managing tenants." action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> New space</Button>} />}
                />
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex items-start gap-2 rounded-md border border-warn/30 bg-warn/5 px-3 py-2 text-[12px] text-fg-muted">
                <Archive className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
                Archived spaces are kept for <span className="text-fg">30 days</span>, then permanently deleted. Restore any time before the deadline.
              </div>
              {loading ? (
                <SkeletonTable />
              ) : (
                <DataTable
                  columns={archivedColumns}
                  rows={archived}
                  getKey={(s) => s.id}
                  empty={<EmptyState icon={Archive} title="Nothing archived" description="Deleted spaces land here for 30 days before permanent deletion." />}
                />
              )}
            </>
          )}
        </div>
      </main>

      <SpaceDrawer space={selected} busy={busyId === selected?.id} onClose={() => setSelected(null)} onArchive={archive} />
      {createOpen && <CreateSpaceModal onClose={() => setCreateOpen(false)} onDone={() => { setCreateOpen(false); reload(); }} />}
    </>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border-b border-border p-4 last:border-0"><div className="h-4 w-full animate-pulse rounded bg-surface-2" /></div>
      ))}
    </div>
  );
}

function CreateSpaceModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { createSpace } = useSpaces();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    const s = await createSpace(name.trim());
    setBusy(false);
    if (s) onDone();
    else setError("You don't have permission to create a space.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[16vh]" onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-lg border border-border-strong bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-border px-4 py-3"><h2 className="text-[14px] font-medium text-fg">Create a new space</h2></div>
        <div className="space-y-3 p-4 text-[13px]">
          <label className="block">
            <span className="mb-1 block text-[12px] text-fg-muted">Space name</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="e.g. Marketing Site" className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-accent" />
          </label>
          {error && <p className="text-[12px] text-err">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!name.trim() || busy} onClick={submit}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Create space
          </Button>
        </div>
      </div>
    </div>
  );
}

function SpaceDrawer({ space, busy, onClose, onArchive }: { space: Space | null; busy: boolean; onClose: () => void; onArchive: (id: string) => void }) {
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { setConfirm(false); }, [space]);
  return (
    <Drawer
      open={!!space}
      onClose={onClose}
      title={space?.name ?? "Space"}
      footer={space && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm"><ExternalLink className="h-3.5 w-3.5" /> Open</Button>
            <Button variant="secondary" size="sm"><Copy className="h-3.5 w-3.5" /> Clone</Button>
          </div>
          {confirm ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirm(false)} className="text-[12px] text-fg-muted hover:text-fg">Cancel</button>
              <Button variant="danger" size="sm" disabled={busy} onClick={() => onArchive(space.id)}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Confirm archive
              </Button>
            </div>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirm(true)}><Trash2 className="h-3.5 w-3.5" /> Delete space</Button>
          )}
        </div>
      )}
    >
      {space && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_META[space.status].tone} dot>{STATUS_META[space.status].label}</Badge>
            <Badge tone={PLAN_TONE[space.plan]}>{space.plan}</Badge>
          </div>
          {confirm && (
            <div className="flex items-start gap-2 rounded-md border border-err/30 bg-err/5 px-3 py-2 text-[12px] text-fg-muted">
              <Trash2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-err" />
              This moves <span className="font-medium text-fg">{space.name}</span> to the 30-day archive. Restore it any time before then from the Archived tab.
            </div>
          )}
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
