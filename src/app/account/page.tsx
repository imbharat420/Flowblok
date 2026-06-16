"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import type {
  AccountSnapshot,
  AccountRole,
  PersonalAccessToken,
  ThemeChoice,
  ThemeMode,
  TokenPermission,
} from "@/server/account/account.types";
import {
  ChevronLeft, Check, Loader2, Code2, PenTool, Github, Upload, Trash2, Plus, KeyRound, Copy, X,
} from "lucide-react";

type Section = "account" | "appearance" | "security" | "tokens" | "privacy" | "danger";

const NAV: { group: string; items: { key: Section; label: string }[] }[] = [
  { group: "General", items: [{ key: "account", label: "Account" }, { key: "appearance", label: "Appearance" }] },
  { group: "Security", items: [{ key: "security", label: "Account Security" }, { key: "tokens", label: "Personal Access Tokens" }] },
  { group: "Misc", items: [{ key: "privacy", label: "Privacy" }, { key: "danger", label: "Danger zone" }] },
];

export default function AccountPage() {
  const [snap, setSnap] = useState<AccountSnapshot | null>(null);
  const [section, setSection] = useState<Section>("account");

  const reload = () => fetch("/api/account").then((r) => r.json()).then(setSnap);
  useEffect(() => { reload(); }, []);

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg px-4">
        <Link href="/dashboard" className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[13px] text-fg-muted hover:bg-surface-2 hover:text-fg">
          <ChevronLeft className="h-4 w-4" /> Back to app
        </Link>
        <div className="h-4 w-px bg-border" />
        <span className="text-[13px] font-medium text-fg">Account</span>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="w-[240px] shrink-0 overflow-y-auto border-r border-border bg-surface px-3 py-5">
          {NAV.map((g) => (
            <div key={g.group} className="mb-4">
              <p className="label-caps px-2 pb-1.5">{g.group}</p>
              {g.items.map((it) => (
                <button
                  key={it.key}
                  onClick={() => setSection(it.key)}
                  className={cn(
                    "relative flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors",
                    section === it.key ? "bg-surface-3 font-medium text-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  {section === it.key && <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />}
                  {it.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto px-8 py-7">
          <div className="mx-auto max-w-[720px]">
            {!snap ? (
              <p className="text-[13px] text-fg-muted">Loading account…</p>
            ) : section === "account" ? (
              <AccountSection snap={snap} onSaved={reload} />
            ) : section === "appearance" ? (
              <AppearanceSection snap={snap} onSaved={reload} />
            ) : section === "security" ? (
              <SecuritySection snap={snap} onSaved={reload} />
            ) : section === "tokens" ? (
              <TokensSection snap={snap} onChanged={reload} />
            ) : section === "privacy" ? (
              <PrivacySection snap={snap} onSaved={reload} />
            ) : (
              <DangerSection />
            )}
          </div>
        </main>
      </div>
    </>
  );
}

/* ───────── shared bits ───────── */

function SectionHead({ title, onSave, saving, saved }: { title: string; onSave?: () => void; saving?: boolean; saved?: boolean }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
      {onSave && (
        <Button variant="primary" onClick={onSave} disabled={saving}>
          {saved ? <Check className="h-3.5 w-3.5" /> : saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saved ? "Saved" : saving ? "Saving…" : "Save"}
        </Button>
      )}
    </div>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="mb-1 block text-[13px] font-medium text-fg">
      {children}
      {hint && <span className="ml-1 font-normal text-fg-subtle">{hint}</span>}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-fg outline-none focus:border-accent" />;
}

function useSaver(fn: () => Promise<unknown>) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = async () => {
    setSaving(true);
    await fn();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  return { save, saving, saved };
}

/* ───────── Account ───────── */

function AccountSection({ snap, onSaved }: { snap: AccountSnapshot; onSaved: () => void }) {
  const p = snap.profile;
  const [form, setForm] = useState(p);
  useEffect(() => setForm(p), [p]);
  const { save, saving, saved } = useSaver(async () => {
    await fetch("/api/account/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    onSaved();
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const roles: { key: AccountRole; label: string; icon: typeof Code2 }[] = [
    { key: "developer", label: "Developer", icon: Code2 },
    { key: "content_creator", label: "Content Creator", icon: PenTool },
  ];

  return (
    <>
      <SectionHead title="Account" onSave={save} saving={saving} saved={saved} />

      <div className="mb-6 flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-md text-[22px] font-semibold text-white" style={{ background: form.avatarColor }}>
          {(form.firstName[0] ?? form.username[0] ?? "U").toUpperCase()}
        </span>
        <div>
          <Button variant="secondary" size="sm"><Upload className="h-3.5 w-3.5" /> Upload photo</Button>
          <p className="mt-1.5 text-[12px] text-fg-subtle">Recommended: 500px × 500px (JPG or PNG)</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <FieldLabel hint="*">Email</FieldLabel>
          <TextInput value={form.email} onChange={(e) => set({ email: e.target.value })} />
        </div>
        <div>
          <FieldLabel>Username</FieldLabel>
          <TextInput value={form.username} onChange={(e) => set({ username: e.target.value })} />
          <label className="mt-2 flex items-center gap-2 text-[13px] text-fg">
            <input type="checkbox" checked={form.showUsernameAsCollaborator} onChange={(e) => set({ showUsernameAsCollaborator: e.target.checked })} className="h-4 w-4 rounded accent-[var(--accent)]" />
            Show username instead of email as a collaborator
          </label>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel>First name</FieldLabel>
            <TextInput value={form.firstName} placeholder="Jane" onChange={(e) => set({ firstName: e.target.value })} />
          </div>
          <div>
            <FieldLabel>Last name</FieldLabel>
            <TextInput value={form.lastName} placeholder="Doe" onChange={(e) => set({ lastName: e.target.value })} />
          </div>
        </div>
        <div>
          <FieldLabel hint="*">Role</FieldLabel>
          <div className="flex gap-3">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = form.role === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => set({ role: r.key })}
                  className={cn("flex w-40 flex-col items-center gap-2 rounded-lg border px-4 py-5 transition-colors", active ? "border-accent bg-accent/10" : "border-border bg-bg hover:border-border-strong")}
                >
                  <Icon className={cn("h-7 w-7", active ? "text-accent" : "text-fg-muted")} />
                  <span className="text-[13px] font-medium text-fg">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-[14px] font-medium text-fg">Connect External Accounts</p>
          <p className="mt-1 text-[12px] text-fg-muted">Connect additional sign-in methods to your account.</p>
          <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2.5">
            <span className="flex items-center gap-2.5 text-[13px]">
              <Github className="h-4 w-4 text-fg" />
              <span>
                <span className="block font-medium text-fg">GitHub</span>
                {form.githubConnected && <span className="block text-[11px] text-fg-subtle">{form.githubEmail}</span>}
              </span>
            </span>
            <Button variant={form.githubConnected ? "secondary" : "primary"} size="sm" onClick={() => set({ githubConnected: !form.githubConnected })}>
              {form.githubConnected ? "Disconnect" : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────── Appearance ───────── */

const THEMES: { key: ThemeChoice; label: string; dark: boolean }[] = [
  { key: "default", label: "Default", dark: false },
  { key: "dark", label: "Dark", dark: true },
  { key: "light_hc", label: "Light high contrast", dark: false },
  { key: "dark_hc", label: "Dark high contrast", dark: true },
];

function AppearanceSection({ snap, onSaved }: { snap: AccountSnapshot; onSaved: () => void }) {
  const [mode, setMode] = useState<ThemeMode>(snap.appearance.mode);
  const [theme, setTheme] = useState<ThemeChoice>(snap.appearance.theme);
  const { save, saving, saved } = useSaver(async () => {
    await fetch("/api/account/appearance", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, theme }) });
    const dark = theme === "dark" || theme === "dark_hc";
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    onSaved();
  });

  return (
    <>
      <SectionHead title="Appearance" onSave={save} saving={saving} saved={saved} />
      <p className="mb-5 text-[13px] text-fg-muted">Select a single theme, or sync with your system and automatically switch between light and dark themes.</p>
      <FieldLabel>Theme Mode</FieldLabel>
      <select value={mode} onChange={(e) => setMode(e.target.value as ThemeMode)} className="mb-1 w-full max-w-[320px] rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-fg outline-none">
        <option value="single">Single theme</option>
        <option value="sync">Sync with system</option>
      </select>
      <p className="mb-5 text-[12px] text-fg-subtle">{mode === "single" ? "Flowblok will use your selected theme." : "Flowblok will follow your system light/dark setting."}</p>

      {mode === "single" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {THEMES.map((t) => (
            <button key={t.key} onClick={() => setTheme(t.key)} className={cn("flex items-center gap-2.5 rounded-lg border p-3 text-left transition-colors", theme === t.key ? "border-accent bg-accent/5" : "border-border hover:border-border-strong")}>
              <span className={cn("h-12 w-16 shrink-0 overflow-hidden rounded border border-border", t.dark ? "bg-[#0a0a0a]" : "bg-white")}>
                <span className="block h-3 w-full" style={{ background: t.dark ? "#161616" : "#f0f0f0" }} />
              </span>
              <span className="flex items-center gap-2 text-[13px] font-medium text-fg">
                <span className={cn("grid h-4 w-4 place-items-center rounded-full border", theme === t.key ? "border-accent" : "border-border-strong")}>
                  {theme === t.key && <span className="h-2 w-2 rounded-full bg-accent" />}
                </span>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ───────── Account Security ───────── */

function SecuritySection({ snap, onSaved }: { snap: AccountSnapshot; onSaved: () => void }) {
  const [twoFactor, setTwoFactor] = useState(snap.security.twoFactor);
  const [pwOpen, setPwOpen] = useState(false);

  const toggle2fa = async (v: boolean) => {
    setTwoFactor(v);
    await fetch("/api/account/security", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ twoFactor: v }) });
    onSaved();
  };

  return (
    <>
      <SectionHead title="Account Security" />
      <div className="space-y-6">
        <div>
          <p className="text-[15px] font-semibold text-fg">Password</p>
          <div className="mt-2"><Button variant="secondary" size="sm" onClick={() => setPwOpen(true)}>Change password</Button></div>
        </div>
        <div className="border-t border-border pt-6">
          <p className="text-[15px] font-semibold text-fg">Two-factor authentication</p>
          <p className="mt-1 max-w-[560px] text-[13px] text-fg-muted">Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to login.</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[13px] font-medium text-fg">Require second step at login</span>
            <Switch checked={twoFactor} onChange={toggle2fa} label="Require second step at login" />
          </div>
        </div>
      </div>
      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const valid = next.length >= 8 && next === confirm;
  return (
    <Modal title="Change password" onClose={onClose}>
      {done ? (
        <p className="text-[13px] text-ok">Your password has been updated.</p>
      ) : (
        <div className="space-y-3 text-[13px]">
          <div><FieldLabel>New password</FieldLabel><TextInput type="password" value={next} onChange={(e) => setNext(e.target.value)} /></div>
          <div><FieldLabel>Confirm new password</FieldLabel><TextInput type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          <p className="text-[12px] text-fg-subtle">Minimum 8 characters. You enter this yourself — it is never pre-filled.</p>
        </div>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>{done ? "Close" : "Cancel"}</Button>
        {!done && <Button variant="primary" size="sm" disabled={!valid} onClick={() => setDone(true)}>Update password</Button>}
      </div>
    </Modal>
  );
}

/* ───────── Personal Access Tokens ───────── */

function daysUntil(iso: string) { return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86400000)); }
function fmt(iso: string) { return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }); }

function TokensSection({ snap, onChanged }: { snap: AccountSnapshot; onChanged: () => void }) {
  const [genOpen, setGenOpen] = useState(false);
  const revoke = async (id: string) => { await fetch(`/api/account/tokens/${id}`, { method: "DELETE" }); onChanged(); };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Personal Access Tokens</h1>
        <Button variant="primary" onClick={() => setGenOpen(true)}><Plus className="h-3.5 w-3.5" /> Generate New Token</Button>
      </div>
      <p className="mb-1 text-[13px] text-fg">Tokens that have been generated to access the <span className="text-accent">Flowblok Management API</span></p>
      <p className="mb-5 text-[12px] text-fg-muted">Personal access tokens work like ordinary OAuth access tokens. They can be used to authenticate yourself to have full access to the Management API programmatically and should NEVER be exposed in public.</p>

      <div className="space-y-3">
        {snap.tokens.map((t) => (
          <div key={t.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[14px] font-medium text-fg">{t.name}</p>
                <p className="mt-0.5 text-[12px] text-fg-muted">Expires: In {daysUntil(t.expiresAt)} days, {fmt(t.expiresAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-fg-subtle">{t.maskedValue}</span>
                {t.deprecated && <Badge tone="neutral">Deprecated</Badge>}
                <button onClick={() => revoke(t.id)} className="grid h-7 w-7 place-items-center rounded text-fg-muted hover:text-err" title="Revoke"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="mt-2"><Badge tone="neutral">{t.permission}</Badge></div>
          </div>
        ))}
        {snap.tokens.length === 0 && <p className="text-[13px] text-fg-muted">No tokens yet.</p>}
      </div>
      {genOpen && <GenerateTokenModal onClose={() => setGenOpen(false)} onCreated={onChanged} />}
    </>
  );
}

function GenerateTokenModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [perm, setPerm] = useState<TokenPermission>("User Permission");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<PersonalAccessToken | null>(null);

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    const res = await fetch("/api/account/tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), permission: perm }) });
    setBusy(false);
    if (res.ok) { setCreated(await res.json()); onCreated(); }
  };

  return (
    <Modal title="Generate New Token" onClose={onClose}>
      {created ? (
        <div className="space-y-2 text-[13px]">
          <p className="text-fg-muted">Copy this token now — you won&apos;t be able to see it again.</p>
          <div className="flex items-center gap-2 rounded-md border border-border bg-bg px-2.5 py-2">
            <KeyRound className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
            <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-fg">{created.plainValue}</span>
            <button onClick={() => navigator.clipboard?.writeText(created.plainValue ?? "")} className="grid h-7 w-7 place-items-center rounded text-fg-muted hover:text-fg"><Copy className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-[13px]">
          <div><FieldLabel>Token name</FieldLabel><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CI deploy" /></div>
          <div>
            <FieldLabel>Permission</FieldLabel>
            <select value={perm} onChange={(e) => setPerm(e.target.value as TokenPermission)} className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-fg outline-none">
              <option>User Permission</option>
              <option>Admin Permission</option>
            </select>
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>{created ? "Done" : "Cancel"}</Button>
        {!created && <Button variant="primary" size="sm" disabled={!name.trim() || busy} onClick={submit}>{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Generate</Button>}
      </div>
    </Modal>
  );
}

/* ───────── Privacy ───────── */

const COOKIES = [
  { name: "_ga", domain: ".flowblok.com" },
  { name: "_flowblok_session", domain: "app.flowblok.com" },
  { name: "fb_role", domain: "app.flowblok.com" },
  { name: "fb_space", domain: "app.flowblok.com" },
  { name: "ph_current_project", domain: ".posthog.com" },
];
const LOCAL = ["StoriesList|per_page", "StoriesList|sort_by", "settings", "block_library_clipboard", "user_colors", "debug"];

function PrivacySection({ snap, onSaved }: { snap: AccountSnapshot; onSaved: () => void }) {
  const [telemetry, setTelemetry] = useState(snap.privacy.telemetry);
  const [cookies, setCookies] = useState(false);
  const [local, setLocal] = useState(false);
  const toggle = async (v: boolean) => {
    setTelemetry(v);
    await fetch("/api/account/privacy", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ telemetry: v }) });
    onSaved();
  };
  return (
    <>
      <SectionHead title="Privacy" />
      <div className="space-y-6">
        <div>
          <p className="text-[15px] font-semibold text-fg">Telemetry</p>
          <p className="mt-1 text-[13px] text-fg-muted">Help us improve the app by sharing usage data. This data is used solely to improve the overall experience.</p>
          <div className="mt-2 flex items-center justify-between border-b border-border pb-3">
            <span className="text-[13px] font-medium text-fg">Allow telemetry</span>
            <Switch checked={telemetry} onChange={toggle} label="Allow telemetry" />
          </div>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-fg">Persistence</p>
          <p className="mt-1 text-[13px] text-fg-muted">We use cookies and localStorage to provide the core functionalities of the application.</p>
          <button onClick={() => setCookies((v) => !v)} className="mt-2 text-[13px] text-accent">{cookies ? "Hide" : "View"} Cookies</button>
          {cookies && (
            <div className="mt-2 overflow-hidden rounded-md border border-border text-[12px]">
              <div className="flex bg-surface px-3 py-1.5 font-medium text-fg-muted"><span className="flex-1">Cookie</span><span className="flex-1">Domain</span></div>
              {COOKIES.map((c) => (<div key={c.name} className="flex border-t border-border px-3 py-1.5"><span className="flex-1 text-fg">{c.name}</span><span className="flex-1 text-fg-muted">{c.domain}</span></div>))}
            </div>
          )}
          <button onClick={() => setLocal((v) => !v)} className="mt-3 block text-[13px] text-accent">{local ? "Hide" : "View"} localStorage</button>
          {local && (
            <div className="mt-2 overflow-hidden rounded-md border border-border text-[12px]">
              {LOCAL.map((k) => (<div key={k} className="border-t border-border px-3 py-1.5 text-fg first:border-0">{k}</div>))}
            </div>
          )}
        </div>
        <div className="border-t border-border pt-5">
          <p className="text-[15px] font-semibold text-fg">Data processing agreement (DPA)</p>
          <p className="mt-1 max-w-[560px] text-[13px] text-fg-muted">Please have a look at our privacy policy, terms of usage, and other legal documents to learn more about us.</p>
          <div className="mt-2"><Button variant="secondary" size="sm">Explore</Button></div>
        </div>
      </div>
    </>
  );
}

/* ───────── Danger zone ───────── */

function DangerSection() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  return (
    <>
      <SectionHead title="Danger zone" />
      <p className="text-[15px] font-semibold text-fg">Delete Account</p>
      <p className="mt-1 max-w-[620px] text-[13px] text-fg-muted">
        We&apos;ll be sorry to see you go, but thanks for trying Flowblok! Deleting your account is permanent. All your data
        will be wiped out immediately and you won&apos;t be able to get it back.
      </p>
      <div className="mt-3"><Button variant="danger" onClick={() => setOpen(true)}><Trash2 className="h-3.5 w-3.5" /> Permanently delete account</Button></div>

      {open && (
        <Modal title="Delete your account?" onClose={() => setOpen(false)} danger>
          {done ? (
            <p className="text-[13px] text-fg-muted">Your account has been scheduled for deletion. (Demo — no data was removed.)</p>
          ) : (
            <div className="space-y-3 text-[13px]">
              <p className="text-fg-muted">This is permanent. Type <span className="font-mono text-fg">DELETE</span> to confirm.</p>
              <TextInput value={typed} onChange={(e) => setTyped(e.target.value)} />
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>{done ? "Close" : "Cancel"}</Button>
            {!done && <Button variant="danger" size="sm" disabled={typed.trim() !== "DELETE"} onClick={() => setDone(true)}>Delete account</Button>}
          </div>
        </Modal>
      )}
    </>
  );
}

/* ───────── Modal ───────── */

function Modal({ title, onClose, children, danger }: { title: string; onClose: () => void; children: React.ReactNode; danger?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[16vh]" onClick={onClose}>
      <div className={cn("w-full max-w-[440px] rounded-lg border bg-surface shadow-2xl", danger ? "border-err/40" : "border-border-strong")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-[14px] font-medium text-fg">{title}</h2>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
