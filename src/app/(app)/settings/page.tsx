"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { useSpaces } from "@/lib/space-context";
import { useRouter } from "next/navigation";
import { REGIONS, RETENTION_OPTIONS } from "@/server/settings/settings.types";
import type {
  DeveloperToggle,
  DomainEntry,
  PlanCard,
  SettingsSnapshot,
} from "@/server/settings/settings.types";
import {
  AlertTriangle,
  CreditCard,
  Globe,
  Plus,
  Settings as SettingsIcon,
  Terminal,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TabKey = "general" | "billing" | "domains" | "developer" | "danger";

const TABS = [
  { key: "general", label: "General", icon: SettingsIcon },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "domains", label: "Domains", icon: Globe },
  { key: "developer", label: "Developer", icon: Terminal },
  { key: "danger", label: "Danger", icon: AlertTriangle },
] as const;

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("general");
  const [data, setData] = useState<SettingsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: SettingsSnapshot) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Settings" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">Space settings</h1>
            <p className="mt-1 text-[13px] text-fg-muted">
              Manage your space configuration, plan, domains and developer access.
            </p>
          </div>

          <div className="mb-6">
            <Tabs tabs={[...TABS]} active={tab} onChange={(k) => setTab(k as TabKey)} />
          </div>

          {loading && <SectionSkeleton />}

          {!loading && data && (
            <>
              {tab === "general" && <GeneralTab snapshot={data} />}
              {tab === "billing" && <BillingTab plans={data.plans} />}
              {tab === "domains" && <DomainsTab initial={data.domains} />}
              {tab === "developer" && <DeveloperTab initial={data.toggles} />}
              {tab === "danger" && <DangerTab spaceName={data.general.name} />}
            </>
          )}
        </div>
      </main>
    </>
  );
}

/* ─────────────────────────── shared bits ─────────────────────────── */

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-5", className)}>{children}</div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-surface" />
      ))}
    </div>
  );
}

/* ─────────────────────────── General ─────────────────────────── */

function GeneralTab({ snapshot }: { snapshot: SettingsSnapshot }) {
  const [name, setName] = useState(snapshot.general.name);
  const [region, setRegion] = useState(snapshot.general.region);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [retention, setRetention] = useState(snapshot.archiveRetentionDays);
  const [retSaved, setRetSaved] = useState(false);

  const dirty = name.trim() !== snapshot.general.name || region !== snapshot.general.region;

  async function saveRetention(days: number) {
    setRetention(days);
    setRetSaved(false);
    await fetch("/api/settings/archive", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    }).catch(() => {});
    snapshot.archiveRetentionDays = days;
    setRetSaved(true);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings/general", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), region }),
    }).catch(() => {});
    snapshot.general.name = name.trim();
    snapshot.general.region = region;
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="space-y-5">
    <Card>
      <p className="label-caps mb-4">General</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Space name" hint="Shown across the dashboard and in the API.">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-fg outline-none transition-colors focus:border-border-strong placeholder:text-fg-subtle"
            placeholder="My space"
          />
        </Field>

        <Field label="Region" hint="Where this space's content is hosted.">
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setSaved(false);
            }}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-fg outline-none transition-colors focus:border-border-strong"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <Button variant="primary" size="sm" onClick={save} disabled={!dirty || saving}>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {saved && !dirty && (
          <span className="flex items-center gap-1 text-[12px] text-ok">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
        <span className="ml-auto font-mono text-[11px] text-fg-subtle">{snapshot.general.spaceId}</span>
      </div>
    </Card>

    <Card>
      <p className="label-caps mb-4">Archive &amp; retention</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Keep deleted items for"
          hint="Archived items move to the bin and are permanently deleted after this period. Choose Lifetime to keep them until you delete them manually."
        >
          <select
            value={retention}
            onChange={(e) => saveRetention(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-fg outline-none transition-colors focus:border-border-strong"
          >
            {RETENTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-[12px] text-fg-muted">
        {retention === 0 ? (
          <span>Archived items are kept forever until you delete them.</span>
        ) : (
          <span>
            Items in the bin are auto-deleted{" "}
            <span className="text-fg">{RETENTION_OPTIONS.find((o) => o.value === retention)?.label}</span> after they&apos;re archived.
          </span>
        )}
        {retSaved && (
          <span className="ml-auto flex items-center gap-1 text-ok">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </Card>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-fg">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-fg-subtle">{hint}</span>}
    </label>
  );
}

/* ─────────────────────────── Billing ─────────────────────────── */

function BillingTab({ plans }: { plans: PlanCard[] }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="label-caps">Plans</p>
        <p className="text-[12px] text-fg-muted">
          Billed monthly · next invoice <span className="nums text-fg">Jul 1, 2026</span>
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={cn(
              "flex flex-col rounded-lg border bg-surface p-4",
              p.current ? "border-accent/50 ring-1 ring-accent/30" : "border-border",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-fg">{p.name}</p>
              {p.current && (
                <Badge tone="accent" dot>
                  Current plan
                </Badge>
              )}
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="nums text-2xl font-semibold tracking-tight text-fg">{p.price}</span>
              {p.cadence && <span className="text-[12px] text-fg-subtle">{p.cadence}</span>}
            </div>
            <p className="mt-1 text-[12px] text-fg-muted">{p.tagline}</p>

            <ul className="mt-3 flex-1 space-y-1.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-[12px] text-fg-muted">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-ok" /> {f}
                </li>
              ))}
            </ul>

            <div className="mt-4">
              {p.current ? (
                <Button variant="secondary" size="sm" className="w-full" disabled>
                  Current plan
                </Button>
              ) : (
                <Button variant={p.ctaVariant} size="sm" className="w-full">
                  {p.cta}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Domains ─────────────────────────── */

function DomainsTab({ initial }: { initial: DomainEntry[] }) {
  const [domains, setDomains] = useState<DomainEntry[]>(initial);
  const [host, setHost] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function add() {
    const clean = host.trim().toLowerCase();
    if (!clean) return;
    setAdding(true);
    setError(null);
    const res = await fetch("/api/settings/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: clean }),
    }).catch(() => null);
    setAdding(false);
    if (!res || !res.ok) {
      setError("Enter a valid, unique domain (e.g. www.example.com).");
      return;
    }
    const created: DomainEntry = await res.json();
    setDomains((d) => [...d, created]);
    setHost("");
  }

  return (
    <Card>
      <p className="label-caps mb-4">Custom domains</p>

      <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
        {domains.map((d) => (
          <li key={d.id} className="flex items-center gap-3 bg-bg px-3.5 py-3">
            <Globe className="h-4 w-4 shrink-0 text-fg-subtle" />
            <span className="font-mono text-[13px] text-fg">{d.host}</span>
            {d.primary && (
              <Badge tone="info" dot>
                Primary
              </Badge>
            )}
            <span className="ml-auto">
              {d.status === "verified" ? (
                <Badge tone="ok" dot>
                  Verified
                </Badge>
              ) : (
                <Badge tone="warn" dot>
                  Pending
                </Badge>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-border pt-4">
        <span className="mb-1.5 block text-[12px] font-medium text-fg">Add a domain</span>
        <div className="flex gap-2">
          <input
            value={host}
            onChange={(e) => {
              setHost(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="blog.example.com"
            className="flex-1 rounded-md border border-border bg-bg px-3 py-2 font-mono text-[13px] text-fg outline-none transition-colors focus:border-border-strong placeholder:text-fg-subtle"
          />
          <Button variant="primary" size="md" onClick={add} disabled={adding || !host.trim()}>
            {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add domain
          </Button>
        </div>
        {error ? (
          <p className="mt-1.5 text-[11px] text-err">{error}</p>
        ) : (
          <p className="mt-1.5 text-[11px] text-fg-subtle">
            New domains start as pending until DNS verification completes.
          </p>
        )}
      </div>
    </Card>
  );
}

/* ─────────────────────────── Developer ─────────────────────────── */

function DeveloperTab({ initial }: { initial: DeveloperToggle[] }) {
  const [toggles, setToggles] = useState<DeveloperToggle[]>(initial);
  const [pending, setPending] = useState<string | null>(null);

  async function flip(t: DeveloperToggle) {
    const next = !t.enabled;
    setPending(t.id);
    setToggles((all) => all.map((x) => (x.id === t.id ? { ...x, enabled: next } : x)));
    const res = await fetch(`/api/settings/toggles/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    }).catch(() => null);
    if (!res || !res.ok) {
      // revert on failure
      setToggles((all) => all.map((x) => (x.id === t.id ? { ...x, enabled: !next } : x)));
    }
    setPending(null);
  }

  return (
    <Card className="p-0">
      <p className="label-caps px-5 pb-0 pt-5">Developer</p>
      <ul className="mt-3 divide-y divide-border">
        {toggles.map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-fg">{t.label}</p>
              <p className="mt-0.5 text-[12px] text-fg-muted">{t.description}</p>
            </div>
            <button
              role="switch"
              aria-checked={t.enabled}
              aria-label={t.label}
              disabled={pending === t.id}
              onClick={() => flip(t)}
              className={cn(
                "relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors disabled:opacity-50",
                t.enabled ? "border-accent bg-accent" : "border-border-strong bg-surface-3",
              )}
            >
              <span
                className={cn(
                  "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left]",
                  t.enabled ? "left-[18px]" : "left-0.5",
                )}
              />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ─────────────────────────── Danger ─────────────────────────── */

function DangerTab({ spaceName }: { spaceName: string }) {
  const { can } = useAuth();
  const { current, refresh } = useSpaces();
  const router = useRouter();
  const allowed = can("manage_billing"); // owner / super admin only
  const [open, setOpen] = useState(false);

  const targetName = current?.name ?? spaceName;
  const targetId = current?.id;

  return (
    <div className="rounded-lg border border-err/40 bg-err/5 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-err/40 bg-err/10 text-err">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-[14px] font-medium text-fg">Delete this space</p>
          <p className="mt-1 text-[13px] text-fg-muted">
            Delete <span className="font-medium text-fg">{targetName}</span>, including all stories,
            components, assets and workflows. It moves to a <span className="text-fg">30-day archive</span>{" "}
            where it can be restored from <span className="text-fg">Spaces → Archived</span> before it is
            permanently purged.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Button variant="danger" size="sm" disabled={!allowed} onClick={() => setOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete space
            </Button>
            {!allowed && <span className="text-[12px] text-fg-subtle">Only the Owner can delete this space.</span>}
          </div>
        </div>
      </div>

      {open && allowed && targetId && (
        <DeleteSpaceModal
          spaceName={targetName}
          onClose={() => setOpen(false)}
          onArchive={async () => {
            const res = await fetch(`/api/spaces/${targetId}/archive`, { method: "POST" });
            if (!res.ok) return false;
            await refresh();
            return true;
          }}
          onDone={() => {
            setOpen(false);
            router.push("/spaces?view=archived");
          }}
        />
      )}
    </div>
  );
}

function DeleteSpaceModal({
  spaceName,
  onClose,
  onArchive,
  onDone,
}: {
  spaceName: string;
  onClose: () => void;
  onArchive: () => Promise<boolean>;
  onDone: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const match = typed.trim() === spaceName;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async () => {
    if (!match || busy) return;
    setBusy(true);
    setError(null);
    const ok = await onArchive();
    setBusy(false);
    if (ok) onDone();
    else setError("You don't have permission to delete this space.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[16vh]" onClick={onClose}>
      <div className="w-full max-w-[460px] rounded-lg border border-err/40 bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-err/40 bg-err/10 text-err">
            <Trash2 className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-[14px] font-medium text-fg">Delete {spaceName}?</h2>
        </div>
        <div className="space-y-3 p-4 text-[13px]">
          <p className="text-fg-muted">
            This space and all its content move to the archive. You have <span className="font-medium text-fg">30 days</span> to
            restore it from <span className="text-fg">Spaces → Archived</span>; after that it is permanently deleted.
          </p>
          <label className="block">
            <span className="mb-1 block text-[12px] text-fg-muted">
              Type <span className="font-mono text-fg">{spaceName}</span> to confirm
            </span>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-[13px] text-fg outline-none focus:border-err"
            />
          </label>
          {error && <p className="text-[12px] text-err">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="danger" size="sm" disabled={!match || busy} onClick={submit}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {busy ? "Archiving…" : "Delete & archive"}
          </Button>
        </div>
      </div>
    </div>
  );
}
