"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { KpiCard } from "@/components/ui/kpi-card";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import type { AnalyticsDashboard, AnalyticsRole, BreakdownItem } from "@/server/analytics/analytics.types";
import {
  Activity,
  BarChart3,
  Briefcase,
  Bug,
  CircleCheck,
  Clock,
  Code2,
  DollarSign,
  FileCheck,
  Gauge,
  GitPullRequest,
  Megaphone,
  Repeat,
  Rocket,
  Server,
  Target,
  TrendingUp,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

const ICONS: Record<string, LucideIcon> = {
  DollarSign,
  TrendingUp,
  Users,
  Repeat,
  Activity,
  Gauge,
  TriangleAlert,
  Server,
  FileCheck,
  Clock,
  Target,
  Megaphone,
  Rocket,
  CircleCheck,
  GitPullRequest,
  Bug,
};

const ROLE_TABS: Array<{ key: AnalyticsRole; label: string; icon: LucideIcon }> = [
  { key: "ceo", label: "CEO", icon: Briefcase },
  { key: "cto", label: "CTO", icon: Server },
  { key: "manager", label: "Manager", icon: Users },
  { key: "dev", label: "Dev", icon: Code2 },
];

const DAY_LABELS = ["14d", "", "", "", "10d", "", "", "7d", "", "", "", "3d", "", "now"];

export default function AnalyticsPage() {
  const [role, setRole] = useState<AnalyticsRole>("ceo");
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/analytics?role=${role}`)
      .then((r) => r.json())
      .then((d: AnalyticsDashboard) => {
        if (!active) return;
        setData(d);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [role]);

  return (
    <>
      <Topbar title="Analytics" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">Analytics</h1>
            <p className="mt-1 text-[13px] text-fg-muted">
              {data?.summary ?? "Role-based dashboards — pick a lens to see the metrics that matter."}
            </p>
          </div>

          {/* role selector */}
          <div className="mb-5">
            <Tabs
              tabs={ROLE_TABS}
              active={role}
              onChange={(k) => setRole(k as AnalyticsRole)}
            />
          </div>

          {/* KPI row — 4 per role */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loading || !data
              ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
              : data.kpis.map((k) => (
                  <KpiCard
                    key={k.key}
                    label={k.label}
                    value={k.value}
                    delta={{ value: k.delta, positive: k.positive }}
                    icon={ICONS[k.icon]}
                  />
                ))}
          </div>

          {/* traffic sparkline */}
          <div className="mt-3 rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="label-caps flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-fg-subtle" /> Traffic · last 14 days
              </p>
              {data && !loading && (
                <span className="nums text-[12px] text-fg-muted">
                  {data.traffic.reduce((a, b) => a + b, 0).toLocaleString()} total
                </span>
              )}
            </div>
            {loading || !data ? (
              <div className="mt-4 h-32 animate-pulse rounded-md bg-surface-2" />
            ) : (
              <Sparkline values={data.traffic} />
            )}
          </div>

          {/* breakdown cards */}
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <BreakdownCard
              title="Top pages"
              unitLabel="views"
              items={data?.topPages}
              loading={loading || !data}
            />
            <BreakdownCard
              title="Traffic sources"
              unitLabel="sessions"
              items={data?.sources}
              loading={loading || !data}
            />
          </div>

          {data && !loading && (
            <p className="mt-3 text-[12px] text-fg-muted">
              Viewing as <span className="text-fg">{data.roleLabel}</span> · served by{" "}
              <span className="font-mono text-fg-subtle">GET /api/analytics?role={data.role}</span>{" "}
              (controller → service → repository)
            </p>
          )}
        </div>
      </main>
    </>
  );
}

/* ---------- pure-CSS area/bar sparkline ---------- */

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="mt-4">
      <div className="flex h-32 items-end gap-1">
        {values.map((v, i) => {
          const pct = Math.max(4, Math.round((v / max) * 100));
          const isLatest = i === values.length - 1;
          return (
            <div key={i} className="group flex h-full flex-1 flex-col justify-end">
              <div
                className={cn(
                  "w-full rounded-t-[3px] transition-colors",
                  isLatest ? "bg-accent" : "bg-surface-3 group-hover:bg-border-strong",
                )}
                style={{ height: `${pct}%` }}
                title={`${v.toLocaleString()}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1">
        {DAY_LABELS.map((l, i) => (
          <span key={i} className="nums flex-1 text-center text-[10px] text-fg-subtle">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- WakaTime-style horizontal bar list ---------- */

function BreakdownCard({
  title,
  unitLabel,
  items,
  loading,
}: {
  title: string;
  unitLabel: string;
  items?: BreakdownItem[];
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="label-caps mb-3">{title}</p>
      {loading || !items ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 animate-pulse rounded bg-surface-2" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-fg-muted">No data for this period.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.label} className="relative overflow-hidden rounded-md">
              <div
                className="absolute inset-y-0 left-0 rounded-md bg-surface-3"
                style={{ width: `${it.percent}%` }}
              />
              <div className="relative flex items-center justify-between px-2.5 py-1.5">
                <span className="truncate pr-3 text-[13px] text-fg">{it.label}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="nums text-[12px] text-fg-muted">
                    {it.value.toLocaleString()} {unitLabel}
                  </span>
                  <span className="nums w-9 text-right text-[12px] font-medium text-fg">
                    {it.percent}%
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="h-3 w-20 animate-pulse rounded bg-surface-2" />
      <div className="mt-3 h-7 w-24 animate-pulse rounded bg-surface-2" />
    </div>
  );
}
