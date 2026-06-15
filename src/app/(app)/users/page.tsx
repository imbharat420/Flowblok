"use client";

import { Topbar } from "@/components/app-shell/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Tabs } from "@/components/ui/tabs";
import { KpiCard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import {
  ROLES,
  ROLE_LABEL,
  ALL_CAPABILITIES,
  capabilitiesOf,
  isSuperAdmin,
} from "@/lib/rbac";
import type { Capability, Role, User, UserStatus } from "@/lib/types";
import {
  Users as UsersIcon,
  ShieldCheck,
  Check,
  Minus,
  UserPlus,
  Crown,
  CircleSlash,
  MailCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface UsersResponse {
  items: User[];
  total: number;
  meta: {
    statusBreakdown: Record<UserStatus, number>;
    roleBreakdown: Record<Role, number>;
  };
}

const STATUS_TONE: Record<UserStatus, { tone: BadgeTone; label: string }> = {
  active: { tone: "ok", label: "Active" },
  invited: { tone: "info", label: "Invited" },
  suspended: { tone: "err", label: "Suspended" },
};

const TABS = [
  { key: "members", label: "Members", icon: UsersIcon },
  { key: "roles", label: "Roles & Permissions", icon: ShieldCheck },
];

// Human-readable labels for the capability matrix rows.
const CAP_LABEL: Record<Capability, string> = {
  view_dashboard: "View dashboard",
  manage_spaces: "Manage spaces",
  edit_content: "Edit content",
  edit_components: "Edit components",
  edit_data: "Edit data tables",
  manage_workflows: "Manage workflows",
  manage_apis: "Manage APIs",
  manage_crm: "Manage CRM",
  manage_commerce: "Manage commerce",
  use_ai: "Use AI agents",
  view_analytics: "View analytics",
  manage_marketplace: "Manage marketplace",
  manage_assets: "Manage assets",
  manage_users: "Manage users & roles",
  manage_settings: "Manage settings",
  manage_billing: "Manage billing",
  use_developer_mode: "Use developer mode",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function UsersPage() {
  const [tab, setTab] = useState<string>("members");
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then((d: UsersResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar title="Users & Roles" breadcrumb={["Acme Digital"]} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px]">
          <PageHeader
            title="Users & Roles"
            description="The RBAC control center — manage members, invitations and the role → capability matrix."
            actions={
              <Button variant="primary" onClick={() => setInviteOpen(true)}>
                <UserPlus className="h-3.5 w-3.5" /> Invite member
              </Button>
            }
          />

          <div className="mb-5">
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
          </div>

          {tab === "members" ? (
            <MembersTab data={data} loading={loading} onInvite={() => setInviteOpen(true)} />
          ) : (
            <RolesTab roleBreakdown={data?.meta.roleBreakdown} />
          )}
        </div>
      </main>

      <InviteDrawer open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Members tab                                                         */
/* ------------------------------------------------------------------ */

function MembersTab({
  data,
  loading,
  onInvite,
}: {
  data: UsersResponse | null;
  loading: boolean;
  onInvite: () => void;
}) {
  const columns: Column<User>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Member",
        render: (u) => (
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
              style={{ backgroundColor: u.avatarColor }}
            >
              {initials(u.name)}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate font-medium text-fg">
                {u.name}
                {u.role === "owner" && <Crown className="h-3 w-3 shrink-0 text-accent" />}
              </div>
              <div className="truncate text-[11px] text-fg-subtle">{u.email}</div>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        render: (u) => <Badge tone="accent">{ROLE_LABEL[u.role]}</Badge>,
      },
      {
        key: "status",
        header: "Status",
        render: (u) => {
          const s = STATUS_TONE[u.status];
          return (
            <Badge tone={s.tone} dot>
              {s.label}
            </Badge>
          );
        },
      },
      {
        key: "lastActive",
        header: "Last active",
        align: "right",
        className: "nums text-[12px] text-fg-subtle",
        render: (u) => relativeTime(u.lastActive),
      },
    ],
    [],
  );

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total members" value={data?.total ?? "—"} icon={UsersIcon} />
        <KpiCard
          label="Active"
          value={data?.meta.statusBreakdown.active ?? "—"}
          icon={Check}
        />
        <KpiCard
          label="Pending invites"
          value={data?.meta.statusBreakdown.invited ?? "—"}
          icon={MailCheck}
        />
        <KpiCard
          label="Suspended"
          value={data?.meta.statusBreakdown.suspended ?? "—"}
          icon={CircleSlash}
        />
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
            >
              <div className="h-7 w-7 animate-pulse rounded-full bg-surface-2" />
              <div className="h-4 flex-1 animate-pulse rounded bg-surface-2" />
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getKey={(u) => u.id}
          empty={
            <EmptyState
              icon={UsersIcon}
              title="No members yet"
              description="Invite your team to start collaborating in this space."
              action={
                <Button variant="primary" onClick={onInvite}>
                  <UserPlus className="h-3.5 w-3.5" /> Invite member
                </Button>
              }
            />
          }
        />
      )}

      {!loading && data && (
        <p className="mt-3 text-[12px] text-fg-muted">
          Showing <span className="nums text-fg">{data.items.length}</span> of{" "}
          <span className="nums text-fg">{data.total}</span> members · served by{" "}
          <span className="font-mono text-fg-subtle">GET /api/users</span> (controller → service →
          repository)
        </p>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Roles & Permissions tab — the capability matrix                     */
/* ------------------------------------------------------------------ */

function RolesTab({ roleBreakdown }: { roleBreakdown?: Record<Role, number> }) {
  return (
    <>
      <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-border bg-surface px-4 py-3">
        <Crown className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p className="text-[12px] leading-relaxed text-fg-muted">
          <span className="font-medium text-fg">Owner is the super admin</span> — implicitly granted
          every capability and not subject to the matrix below. All other roles receive an explicit
          allow-list. Permissions are enforced everywhere through a single{" "}
          <span className="font-mono text-fg-subtle">can()</span> check.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="sticky left-0 z-10 bg-surface px-4 py-2.5 font-medium text-fg-muted">
                Capability
              </th>
              {ROLES.map((role) => (
                <th key={role} className="px-3 py-2.5 text-center font-medium">
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[12px]",
                        isSuperAdmin(role) ? "text-accent" : "text-fg",
                      )}
                    >
                      {isSuperAdmin(role) && <Crown className="h-3 w-3" />}
                      {role === "owner" ? "Owner" : ROLE_LABEL[role]}
                    </span>
                    {roleBreakdown && (
                      <span className="nums text-[10px] text-fg-subtle">
                        {roleBreakdown[role] ?? 0} member{(roleBreakdown[role] ?? 0) === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_CAPABILITIES.map((cap) => (
              <tr
                key={cap}
                className="border-b border-border bg-bg transition-colors last:border-0 hover:bg-surface"
              >
                <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5">
                  <span className="font-medium text-fg">{CAP_LABEL[cap]}</span>
                  <span className="ml-2 hidden font-mono text-[10px] text-fg-subtle lg:inline">
                    {cap}
                  </span>
                </td>
                {ROLES.map((role) => {
                  const granted = capabilitiesOf(role).includes(cap);
                  return (
                    <td key={role} className="px-3 py-2.5 text-center">
                      {granted ? (
                        <Check className="mx-auto h-4 w-4 text-accent" />
                      ) : (
                        <Minus className="mx-auto h-3.5 w-3.5 text-fg-subtle/40" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-fg-muted">
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-accent" /> Granted
        </span>
        <span className="flex items-center gap-1.5">
          <Minus className="h-3.5 w-3.5 text-fg-subtle/40" /> Not granted
        </span>
        <span className="flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 text-accent" /> Owner = super admin (all capabilities)
        </span>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Invite drawer                                                       */
/* ------------------------------------------------------------------ */

function InviteDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");

  // Owner can't be assigned on invite — it's a single super-admin seat.
  const assignableRoles = ROLES.filter((r) => r !== "owner");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function handleClose() {
    setEmail("");
    setRole("editor");
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title="Invite member"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!valid} onClick={handleClose}>
            <MailCheck className="h-3.5 w-3.5" /> Send invite
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <p className="text-[12px] leading-relaxed text-fg-muted">
          They&apos;ll receive an email invitation and appear as{" "}
          <Badge tone="info" dot>
            Invited
          </Badge>{" "}
          until they accept.
        </p>

        <div>
          <label className="label-caps mb-1.5 block">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@acmedigital.com"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-border-strong"
          />
          {email && !valid && (
            <p className="mt-1 text-[11px] text-err">Enter a valid email address.</p>
          )}
        </div>

        <div>
          <label className="label-caps mb-1.5 block">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-fg outline-none transition-colors focus:border-border-strong"
          >
            {assignableRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border border-border bg-surface px-3 py-2.5">
          <p className="label-caps mb-1.5">Grants {ROLE_LABEL[role]}</p>
          <p className="nums text-[12px] text-fg-muted">
            {capabilitiesOf(role).length} of {ALL_CAPABILITIES.length} capabilities
          </p>
        </div>
      </div>
    </Drawer>
  );
}
