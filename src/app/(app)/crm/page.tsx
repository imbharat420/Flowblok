"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiCard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import type {
  Activity,
  Company,
  Contact,
  DealStage,
  PipelineColumn,
} from "@/server/crm/crm.types";
import type { CrmKpis } from "@/server/crm/crm.service";
import {
  Building2,
  CheckSquare,
  KanbanSquare,
  Mail,
  Phone,
  Users,
  Wallet,
  Trophy,
  Briefcase,
} from "lucide-react";
import { useEffect, useState } from "react";

type TabKey = "pipeline" | "contacts" | "companies" | "activities";

const TABS = [
  { key: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { key: "contacts", label: "Contacts", icon: Users },
  { key: "companies", label: "Companies", icon: Building2 },
  { key: "activities", label: "Activities", icon: CheckSquare },
];

const STAGE_TONE: Record<DealStage, BadgeTone> = {
  "New Lead": "neutral",
  Qualified: "info",
  Meeting: "accent",
  Proposal: "warn",
  Won: "ok",
};

const ACTIVITY_META = {
  call: { icon: Phone, tone: "info" as BadgeTone, label: "Call" },
  email: { icon: Mail, tone: "accent" as BadgeTone, label: "Email" },
  task: { icon: CheckSquare, tone: "neutral" as BadgeTone, label: "Task" },
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

interface PipelineResponse {
  columns: PipelineColumn[];
  kpis: CrmKpis;
}

export default function CrmPage() {
  const [tab, setTab] = useState<TabKey>("pipeline");

  const [pipeline, setPipeline] = useState<PipelineResponse | null>(null);
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);

  // Pipeline + KPIs load up-front (KPI row is always visible).
  useEffect(() => {
    fetch("/api/crm/pipeline")
      .then((r) => r.json())
      .then((d: PipelineResponse) => setPipeline(d))
      .catch(() => setPipeline({ columns: [], kpis: { openDeals: 0, pipelineValue: 0, wonValue: 0, contacts: 0 } }));
  }, []);

  // Lazy-load each tab's data on first visit.
  useEffect(() => {
    if (tab === "contacts" && contacts === null) {
      fetch("/api/crm/contacts").then((r) => r.json()).then((d) => setContacts(d.items ?? []));
    }
    if (tab === "companies" && companies === null) {
      fetch("/api/crm/companies").then((r) => r.json()).then((d) => setCompanies(d.items ?? []));
    }
    if (tab === "activities" && activities === null) {
      fetch("/api/crm/activities").then((r) => r.json()).then((d) => setActivities(d.items ?? []));
    }
  }, [tab, contacts, companies, activities]);

  const kpis = pipeline?.kpis;

  const contactColumns: Column<Contact>[] = [
    {
      key: "name",
      header: "Name",
      render: (c) => <span className="font-medium text-fg">{c.name}</span>,
    },
    {
      key: "title",
      header: "Title",
      render: (c) => <span className="text-fg-muted">{c.title}</span>,
    },
    {
      key: "company",
      header: "Company",
      render: (c) => <span className="text-fg-muted">{c.company}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (c) => <span className="font-mono text-[12px] text-fg-subtle">{c.email}</span>,
    },
  ];

  const companyColumns: Column<Company>[] = [
    {
      key: "name",
      header: "Company",
      render: (c) => (
        <span className="flex items-center gap-2 font-medium text-fg">
          <span className="grid h-6 w-6 place-items-center rounded bg-surface-2 text-fg-muted">
            <Building2 className="h-3.5 w-3.5" />
          </span>
          {c.name}
        </span>
      ),
    },
    {
      key: "industry",
      header: "Industry",
      render: (c) => <span className="text-fg-muted">{c.industry}</span>,
    },
    {
      key: "deals",
      header: "Open deals",
      align: "right",
      render: (c) => <span className="nums text-fg">{c.deals}</span>,
    },
  ];

  return (
    <>
      <Topbar title="CRM" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <PageHeader
            title="CRM Lite"
            description="Pipeline, contacts and activity at a glance — the deals that matter, without the bloat."
          />

          {/* KPI row */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard label="Open deals" value={kpis?.openDeals ?? "—"} icon={Briefcase} />
            <KpiCard
              label="Pipeline value"
              value={kpis ? usd(kpis.pipelineValue) : "—"}
              icon={Wallet}
            />
            <KpiCard
              label="Won this month"
              value={kpis ? usd(kpis.wonValue) : "—"}
              delta={{ value: "+12%", positive: true }}
              icon={Trophy}
            />
            <KpiCard label="Contacts" value={kpis?.contacts ?? "—"} icon={Users} />
          </div>

          <div className="mb-5">
            <Tabs tabs={TABS} active={tab} onChange={(k) => setTab(k as TabKey)} />
          </div>

          {/* Pipeline — 5 Kanban columns */}
          {tab === "pipeline" && (
            <PipelineBoard columns={pipeline?.columns ?? null} />
          )}

          {/* Contacts */}
          {tab === "contacts" && (
            <DataTable
              columns={contactColumns}
              rows={contacts ?? []}
              getKey={(r) => r.id}
              empty={
                contacts === null ? (
                  <span className="text-[13px] text-fg-muted">Loading contacts…</span>
                ) : (
                  <EmptyState icon={Users} title="No contacts yet" description="Add a contact to get started." />
                )
              }
            />
          )}

          {/* Companies */}
          {tab === "companies" && (
            <DataTable
              columns={companyColumns}
              rows={companies ?? []}
              getKey={(r) => r.id}
              empty={
                companies === null ? (
                  <span className="text-[13px] text-fg-muted">Loading companies…</span>
                ) : (
                  <EmptyState icon={Building2} title="No companies yet" description="Companies appear as deals are created." />
                )
              }
            />
          )}

          {/* Activities */}
          {tab === "activities" && <ActivityList activities={activities} />}
        </div>
      </main>
    </>
  );
}

function PipelineBoard({ columns }: { columns: PipelineColumn[] | null }) {
  if (columns === null) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-lg border border-border bg-surface" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {columns.map((col) => (
        <div key={col.stage} className="flex flex-col rounded-lg border border-border bg-surface-2/40">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <Badge tone={STAGE_TONE[col.stage]} dot>
              {col.stage}
            </Badge>
            <span className="nums text-[11px] text-fg-subtle">{col.count}</span>
          </div>
          <div className="border-b border-border px-3 py-2">
            <span className="nums text-[12px] font-medium text-fg-muted">{usd(col.value)}</span>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-2">
            {col.deals.length === 0 && (
              <p className="px-1 py-6 text-center text-[12px] text-fg-subtle">No deals</p>
            )}
            {col.deals.map((d) => (
              <div
                key={d.id}
                className={cn(
                  "rounded-md border border-border bg-surface p-2.5 transition-colors",
                  "hover:border-border-strong",
                )}
              >
                <p className="text-[13px] font-medium text-fg">{d.name}</p>
                <p className="mt-0.5 text-[12px] text-fg-muted">{d.company}</p>
                <p className="nums mt-1.5 text-[12px] font-medium text-fg">{usd(d.value)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityList({ activities }: { activities: Activity[] | null }) {
  if (activities === null) {
    return (
      <div className="overflow-hidden rounded-lg border border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-b border-border px-4 py-3 last:border-0">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return <EmptyState icon={CheckSquare} title="No activity yet" description="Calls, emails and tasks show up here." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {activities.map((a) => {
        const meta = ACTIVITY_META[a.type];
        const Icon = meta.icon;
        return (
          <div
            key={a.id}
            className="flex items-center gap-3 border-b border-border bg-bg px-4 py-3 transition-colors last:border-0 hover:bg-surface"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-2 text-fg-muted">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] text-fg">{a.subject}</p>
            </div>
            <Badge tone={meta.tone} dot>
              {meta.label}
            </Badge>
            <span className="nums w-28 shrink-0 text-right text-[12px] text-fg-subtle">
              {new Date(a.when).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
