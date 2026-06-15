import {
  LayoutDashboard,
  Boxes,
  FileText,
  Files,
  Component,
  Database,
  Workflow,
  Webhook,
  Contact,
  ShoppingCart,
  Sparkles,
  BarChart3,
  Store,
  Image,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Capability } from "@/lib/types";

export interface NavItem {
  label: string;
  slug: string; // route under /app group, e.g. "dashboard"
  icon: LucideIcon;
  group: "workspace" | "build" | "data" | "grow" | "system";
  capability: Capability; // gates visibility via rbac.can()
}

// The 16-module left navigation from 04-FRONTEND-SPEC.md.
export const NAV: NavItem[] = [
  { label: "Dashboard", slug: "dashboard", icon: LayoutDashboard, group: "workspace", capability: "view_dashboard" },
  { label: "Spaces", slug: "spaces", icon: Boxes, group: "workspace", capability: "manage_spaces" },

  { label: "Pages", slug: "pages", icon: FileText, group: "build", capability: "edit_content" },
  { label: "Content", slug: "content", icon: Files, group: "build", capability: "edit_content" },
  { label: "Components", slug: "components", icon: Component, group: "build", capability: "edit_components" },

  { label: "Database", slug: "database", icon: Database, group: "data", capability: "edit_data" },
  { label: "Workflows", slug: "workflows", icon: Workflow, group: "data", capability: "manage_workflows" },
  { label: "APIs", slug: "apis", icon: Webhook, group: "data", capability: "manage_apis" },

  { label: "CRM", slug: "crm", icon: Contact, group: "grow", capability: "manage_crm" },
  { label: "Commerce", slug: "commerce", icon: ShoppingCart, group: "grow", capability: "manage_commerce" },
  { label: "AI", slug: "ai", icon: Sparkles, group: "grow", capability: "use_ai" },
  { label: "Analytics", slug: "analytics", icon: BarChart3, group: "grow", capability: "view_analytics" },
  { label: "Marketplace", slug: "marketplace", icon: Store, group: "grow", capability: "manage_marketplace" },

  { label: "Assets", slug: "assets", icon: Image, group: "system", capability: "manage_assets" },
  { label: "Users", slug: "users", icon: UserCog, group: "system", capability: "manage_users" },
  { label: "Settings", slug: "settings", icon: Settings, group: "system", capability: "manage_settings" },
];

export const GROUP_LABELS: Record<NavItem["group"], string> = {
  workspace: "Workspace",
  build: "Build",
  data: "Data & Logic",
  grow: "Grow",
  system: "System",
};

export const navBySlug = (slug: string) => NAV.find((n) => n.slug === slug);
