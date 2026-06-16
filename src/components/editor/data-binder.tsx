"use client";

import { useEffect, useState } from "react";
import type { DataBinding } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type Source = DataBinding["source"];

const SOURCES: { key: Source; label: string; hint: string }[] = [
  { key: "static", label: "Static", hint: "Hard-coded content entered in Design." },
  { key: "database", label: "Database", hint: "Pick a table; fields auto-load and map." },
  { key: "api", label: "API", hint: "Bind to an auto-generated endpoint." },
  { key: "workflow", label: "Workflow", hint: "Render the output of a workflow run." },
  { key: "ai", label: "AI", hint: "Generate content from a prompt." },
  { key: "crm", label: "CRM", hint: "Pull leads, contacts, companies or deals." },
  { key: "commerce", label: "Commerce", hint: "Bind to products or orders." },
];

const CRM_ENTITIES = [
  { ref: "leads", label: "Leads" },
  { ref: "contacts", label: "Contacts" },
  { ref: "companies", label: "Companies" },
  { ref: "deals", label: "Deals (pipeline)" },
];

interface Option {
  ref: string;
  label: string;
}

// Fetches the real options for each source so a block can REFERENCE actual flows.
async function fetchOptions(source: Source): Promise<Option[]> {
  switch (source) {
    case "database": {
      const d = await fetch("/api/database/tables").then((r) => r.json());
      return (d.items ?? []).map((t: { id: string; name: string }) => ({ ref: t.id, label: t.name }));
    }
    case "workflow": {
      const d = await fetch("/api/workflows").then((r) => r.json());
      return (d.items ?? []).map((w: { id: string; name: string }) => ({ ref: w.id, label: w.name }));
    }
    case "commerce": {
      const d = await fetch("/api/commerce/products").then((r) => r.json());
      return (d.items ?? []).map((p: { id: string; name: string }) => ({ ref: p.id, label: p.name }));
    }
    case "crm":
      return CRM_ENTITIES;
    default:
      return [];
  }
}

export function DataBinder({
  binding,
  onChange,
}: {
  binding: DataBinding | undefined;
  onChange: (b: DataBinding) => void;
}) {
  const source: Source = binding?.source ?? "static";
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    // static/ai keep no options; api manages its own catalog in <ApiBinder>.
    if (source === "static" || source === "ai" || source === "api") {
      setOptions([]);
      return;
    }
    setLoading(true);
    fetchOptions(source).then((opts) => {
      if (alive) {
        setOptions(opts);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [source]);

  const pick = (s: Source) => onChange({ source: s });
  const active = SOURCES.find((s) => s.key === source)!;

  return (
    <div className="space-y-3 text-[13px]">
      <p className="text-fg-muted">Bind this block to a data source — no code.</p>

      <div className="space-y-1.5">
        {SOURCES.map((s) => (
          <label
            key={s.key}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2",
              source === s.key ? "border-accent bg-accent/10" : "border-border bg-bg hover:border-border-strong",
            )}
          >
            <input
              type="radio"
              name="data-source"
              checked={source === s.key}
              onChange={() => pick(s.key)}
              className="accent-[var(--accent)]"
            />
            <span className="text-fg">{s.label}</span>
          </label>
        ))}
      </div>

      {/* source-specific configuration */}
      {source === "ai" ? (
        <div className="rounded-md border border-border bg-bg p-2.5">
          <p className="mb-1.5 text-[12px] text-fg-muted">Prompt</p>
          <textarea
            value={binding?.prompt ?? ""}
            onChange={(e) => onChange({ source: "ai", prompt: e.target.value })}
            placeholder="e.g. Summarize the latest 3 blog posts as cards"
            className="h-20 w-full resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none"
          />
        </div>
      ) : source === "api" ? (
        <ApiBinder binding={binding} onChange={onChange} />
      ) : source !== "static" ? (
        <div className="rounded-md border border-border bg-bg p-2.5">
          <p className="mb-1.5 text-[12px] text-fg-muted">
            {source === "database" ? "Table" : source === "workflow" ? "Workflow" : source === "commerce" ? "Product / collection" : "Entity"}
          </p>
          {loading ? (
            <span className="flex items-center gap-2 text-[12px] text-fg-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading {source}…
            </span>
          ) : (
            <select
              value={binding?.ref ?? ""}
              onChange={(e) => {
                const opt = options.find((o) => o.ref === e.target.value);
                onChange({ source, ref: opt?.ref, refLabel: opt?.label });
              }}
              className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none"
            >
              <option value="">Select…</option>
              {options.map((o) => (
                <option key={o.ref} value={o.ref}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          {binding?.ref && (
            <p className="mt-2 font-mono text-[11px] text-fg-subtle">
              bound → {source}:{binding.ref}
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border p-2.5 text-[12px] text-fg-subtle">{active.hint}</p>
      )}
    </div>
  );
}

// ----- method-aware API binding -----------------------------------------

type ApiMethod = NonNullable<DataBinding["apiMethod"]>;

interface ApiFieldSpec {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  values?: string[];
}

interface EndpointProfile {
  id: string;
  method: ApiMethod;
  path: string;
  kind: "read" | "mutation";
  auth: "public" | "jwt" | "api_key";
  resource: string;
  summary: string;
  pathParams: ApiFieldSpec[];
  queryParams: ApiFieldSpec[];
  requestBody: ApiFieldSpec[];
  responseFields: ApiFieldSpec[];
  triggers: string[];
  renderTargets: string[];
  bindingHint: string;
}

interface EndpointSummary {
  id: string;
  method: string;
  path: string;
  resource: string;
  kind?: "read" | "mutation";
}

const METHOD_TONE: Record<ApiMethod, BadgeTone> = {
  GET: "info",
  POST: "ok",
  PUT: "warn",
  PATCH: "warn",
  DELETE: "err",
};

const AUTH_TONE: Record<EndpointProfile["auth"], BadgeTone> = {
  public: "neutral",
  jwt: "accent",
  api_key: "info",
};

const TARGET_LABEL: Record<string, string> = {
  toast: "Toast notification",
  inline_message: "Inline message",
  redirect: "Redirect",
  refresh_block: "Refresh this block",
  action_button: "Action button",
  detail: "Detail",
  list: "List",
  field: "Field",
  form: "Form",
};

function targetLabel(t: string): string {
  return TARGET_LABEL[t] ?? t;
}

function ApiBinder({
  binding,
  onChange,
}: {
  binding: DataBinding | undefined;
  onChange: (b: DataBinding) => void;
}) {
  const [summaries, setSummaries] = useState<EndpointSummary[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [profile, setProfile] = useState<EndpointProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const selectedId = binding?.apiEndpointId ?? "";

  // Fetch the endpoint catalog once.
  useEffect(() => {
    let alive = true;
    setListLoading(true);
    fetch("/api/apis")
      .then((r) => r.json())
      .then((d: { items?: EndpointSummary[] }) => {
        if (alive) {
          setSummaries(d.items ?? []);
          setListLoading(false);
        }
      })
      .catch(() => alive && setListLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Load the full profile whenever the selected endpoint changes.
  useEffect(() => {
    let alive = true;
    if (!selectedId) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    fetch(`/api/apis/${selectedId}`)
      .then((r) => r.json())
      .then((p: EndpointProfile) => {
        if (alive) {
          setProfile(p && p.id ? p : null);
          setProfileLoading(false);
        }
      })
      .catch(() => alive && setProfileLoading(false));
    return () => {
      alive = false;
    };
  }, [selectedId]);

  // Group summaries by resource for the <optgroup>s.
  const groups = summaries.reduce<Record<string, EndpointSummary[]>>((acc, s) => {
    (acc[s.resource] ??= []).push(s);
    return acc;
  }, {});
  const groupNames = Object.keys(groups).sort();

  function selectEndpoint(id: string) {
    const s = summaries.find((x) => x.id === id);
    if (!id || !s) {
      onChange({ source: "api" });
      return;
    }
    const method = s.method as ApiMethod;
    const kind = (s.kind ?? (method === "GET" ? "read" : "mutation")) as "read" | "mutation";
    // reset method-specific maps when switching endpoints
    onChange({
      source: "api",
      apiEndpointId: s.id,
      apiMethod: method,
      apiKind: kind,
      ref: s.id,
      refLabel: `${s.method} ${s.path}`,
      apiTrigger: undefined,
      apiParams: [],
      apiBody: [],
      apiResultTarget: undefined,
    });
  }

  // ----- read helpers ----------------------------------------------------
  const params = binding?.apiParams ?? [];
  const body = binding?.apiBody ?? [];

  function setParam(key: string, value: string) {
    const next = params.filter((p) => p.key !== key);
    if (value !== "") next.push({ key, value });
    onChange({ ...binding, source: "api", apiParams: next });
  }
  function paramValue(key: string): string {
    return params.find((p) => p.key === key)?.value ?? "";
  }

  function setBody(key: string, value: string) {
    const next = body.filter((b) => b.key !== key);
    if (value !== "") next.push({ key, value });
    onChange({ ...binding, source: "api", apiBody: next });
  }
  function bodyValue(key: string): string {
    return body.find((b) => b.key === key)?.value ?? "";
  }

  return (
    <div className="space-y-3">
      {/* endpoint picker */}
      <div className="rounded-md border border-border bg-bg p-2.5">
        <p className="mb-1.5 text-[12px] text-fg-muted">Endpoint</p>
        {listLoading ? (
          <span className="flex items-center gap-2 text-[12px] text-fg-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading endpoints…
          </span>
        ) : (
          <select
            value={selectedId}
            onChange={(e) => selectEndpoint(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none"
          >
            <option value="">Select…</option>
            {groupNames.map((g) => (
              <optgroup key={g} label={g}>
                {groups[g].map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.method} {s.path}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
      </div>

      {/* profile panel */}
      {selectedId && profileLoading && (
        <span className="flex items-center gap-2 text-[12px] text-fg-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading profile…
        </span>
      )}

      {profile && (
        <>
          <div className="space-y-2 rounded-md border border-border bg-bg p-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={METHOD_TONE[profile.method]} dot>
                {profile.method}
              </Badge>
              <span className="capitalize text-[11px] text-fg-muted">{profile.kind}</span>
              <span className="text-fg-subtle">·</span>
              <Badge tone={AUTH_TONE[profile.auth]} dot>
                {profile.auth}
              </Badge>
            </div>
            <p className="font-mono text-[11px] text-fg-subtle">{profile.path}</p>
            <p className="text-[12px] text-fg-muted">{profile.summary}</p>
            <p className="text-[11px] text-fg-subtle">{profile.bindingHint}</p>
          </div>

          {profile.kind === "read" ? (
            <ReadConfig
              profile={profile}
              trigger={binding?.apiTrigger}
              onTrigger={(t) => onChange({ ...binding, source: "api", apiTrigger: t })}
              paramValue={paramValue}
              setParam={setParam}
            />
          ) : (
            <MutationConfig
              profile={profile}
              trigger={binding?.apiTrigger}
              onTrigger={(t) => onChange({ ...binding, source: "api", apiTrigger: t })}
              resultTarget={binding?.apiResultTarget}
              onResultTarget={(t) =>
                onChange({ ...binding, source: "api", apiResultTarget: t })
              }
              bodyValue={bodyValue}
              setBody={setBody}
            />
          )}
        </>
      )}
    </div>
  );
}

function TriggerSelect({
  triggers,
  value,
  onChange,
  defaultTrigger,
}: {
  triggers: string[];
  value: string | undefined;
  onChange: (t: string) => void;
  defaultTrigger: string;
}) {
  const current = value ?? (triggers.includes(defaultTrigger) ? defaultTrigger : triggers[0] ?? "");
  return (
    <div>
      <p className="mb-1.5 text-[12px] text-fg-muted">Trigger</p>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none"
      >
        {triggers.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReadConfig({
  profile,
  trigger,
  onTrigger,
  paramValue,
  setParam,
}: {
  profile: EndpointProfile;
  trigger: string | undefined;
  onTrigger: (t: string) => void;
  paramValue: (key: string) => string;
  setParam: (key: string, value: string) => void;
}) {
  const inputs = [...profile.pathParams, ...profile.queryParams];
  return (
    <div className="space-y-3 rounded-md border border-border bg-bg p-2.5">
      <TriggerSelect
        triggers={profile.triggers}
        value={trigger}
        onChange={onTrigger}
        defaultTrigger="on_load"
      />

      {inputs.length > 0 && (
        <div className="space-y-2">
          <p className="text-[12px] text-fg-muted">Parameters</p>
          {inputs.map((f) => (
            <label key={f.name} className="block">
              <span className="flex items-center gap-1 text-[11px] text-fg-subtle">
                <span className="font-mono text-fg-muted">{f.name}</span>
                <span className="text-fg-subtle">· {f.type}</span>
                {f.required && <span className="text-err">*</span>}
              </span>
              <input
                value={paramValue(f.name)}
                onChange={(e) => setParam(f.name, e.target.value)}
                placeholder={f.description ?? f.name}
                className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none"
              />
            </label>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-[12px] text-fg-muted">Response fields</p>
        <div className="rounded-md border border-border bg-surface">
          {profile.responseFields.map((f) => (
            <div
              key={f.name}
              className="flex items-center justify-between gap-2 border-b border-border px-2.5 py-1.5 last:border-b-0"
            >
              <span className="font-mono text-[11px] text-fg">{f.name}</span>
              <span className="text-[11px] text-fg-subtle">{f.type}</span>
            </div>
          ))}
          {profile.responseFields.length === 0 && (
            <p className="px-2.5 py-1.5 text-[11px] text-fg-subtle">No response fields.</p>
          )}
        </div>
        <p className="text-[11px] text-fg-subtle">
          These fields render into this block (detail / list / field).
        </p>
      </div>
    </div>
  );
}

function MutationConfig({
  profile,
  trigger,
  onTrigger,
  resultTarget,
  onResultTarget,
  bodyValue,
  setBody,
}: {
  profile: EndpointProfile;
  trigger: string | undefined;
  onTrigger: (t: string) => void;
  resultTarget: string | undefined;
  onResultTarget: (t: string) => void;
  bodyValue: (key: string) => string;
  setBody: (key: string, value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-bg p-2.5">
      <TriggerSelect
        triggers={profile.triggers}
        value={trigger}
        onChange={onTrigger}
        defaultTrigger="on_click"
      />

      <div className="space-y-2">
        <p className="text-[12px] text-fg-muted">Request body</p>
        {profile.requestBody.length === 0 && (
          <p className="text-[11px] text-fg-subtle">This endpoint takes no request body.</p>
        )}
        {profile.requestBody.map((f) => (
          <label key={f.name} className="block">
            <span className="flex items-center gap-1 text-[11px] text-fg-subtle">
              <span className="font-mono text-fg-muted">{f.name}</span>
              <span className="text-fg-subtle">· {f.type}</span>
              {f.required && <span className="text-err">*</span>}
            </span>
            <input
              value={bodyValue(f.name)}
              onChange={(e) => setBody(f.name, e.target.value)}
              placeholder={f.description ?? f.name}
              className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none"
            />
          </label>
        ))}
      </div>

      <div>
        <p className="mb-1.5 text-[12px] text-fg-muted">Show result in</p>
        <select
          value={resultTarget ?? ""}
          onChange={(e) => onResultTarget(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-fg outline-none"
        >
          <option value="">Select…</option>
          {profile.renderTargets.map((t) => (
            <option key={t} value={t}>
              {targetLabel(t)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
