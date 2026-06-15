import { Topbar } from "@/components/app-shell/topbar";
import { navBySlug } from "@/lib/nav";
import { notFound } from "next/navigation";
import { Hammer } from "lucide-react";

const ROADMAP: Record<string, string> = {
  spaces: "Multi-space switcher and agency view — clone, template, and manage many client spaces.",
  pages: "The visual page builder: 3-pane editor with the 7 block tabs (Design · Data · Logic · Permissions · Events · SEO · AI).",
  components: "Component/block library with schema editor and AI-generated 'Infinite Components'.",
  database: "Visual table builder with drag-relations; every table auto-generates REST + GraphQL.",
  workflows: "n8n-style dark node canvas with trigger/action/condition nodes and execution logs.",
  apis: "Auto-generated REST + GraphQL + Webhooks + OpenAPI, with a GraphiQL-style explorer.",
  crm: "CRM Lite: Leads → Qualified → Meeting → Proposal → Won pipeline, contacts, companies, activities.",
  commerce: "Native commerce core: products, inventory, orders, coupons, payments.",
  ai: "One-prompt generation: Prompt → Database → Pages → Components → Workflows → APIs → Deploy.",
  analytics: "Role dashboards (CEO/CTO/Manager/Dev) with Tremor KPI cards and WakaTime-style breakdowns.",
  marketplace: "Templates, plugins, workflows, and AI agents — sandboxed, semver, 20% commission.",
  assets: "Media library with optimization, CDN, tagging, and folders.",
  users: "Roles & permissions (Owner→Guest), capability matrix, and per-block permissions.",
  settings: "Space settings, billing tiers, domains, and developer mode toggles.",
};

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const item = navBySlug(module);
  if (!item) notFound();

  const Icon = item.icon;
  return (
    <>
      <Topbar title={item.label} breadcrumb={["Acme Digital"]} />
      <main className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        <div className="max-w-[480px] text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg border border-border bg-surface text-accent">
            <Icon className="h-5 w-5" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-fg">{item.label}</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
            {ROADMAP[module] ?? "This module is part of the Flowblok roadmap."}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium text-fg-muted">
            <Hammer className="h-3 w-3" /> On the roadmap — see docs/planning/05-FEATURE-TICKETS.md
          </p>
        </div>
      </main>
    </>
  );
}
