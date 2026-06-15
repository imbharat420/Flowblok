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

export interface NavItem {
  label: string;
  slug: string; // route under /app group, e.g. "dashboard"
  icon: LucideIcon;
  group: "workspace" | "build" | "data" | "grow" | "system";
  ready?: boolean; // has a real screen in this first visualization
}

// The 16-module left navigation from 04-FRONTEND-SPEC.md.
export const NAV: NavItem[] = [
  { label: "Dashboard", slug: "dashboard", icon: LayoutDashboard, group: "workspace", ready: true },
  { label: "Spaces", slug: "spaces", icon: Boxes, group: "workspace" },

  { label: "Pages", slug: "pages", icon: FileText, group: "build" },
  { label: "Content", slug: "content", icon: Files, group: "build", ready: true },
  { label: "Components", slug: "components", icon: Component, group: "build" },

  { label: "Database", slug: "database", icon: Database, group: "data" },
  { label: "Workflows", slug: "workflows", icon: Workflow, group: "data" },
  { label: "APIs", slug: "apis", icon: Webhook, group: "data" },

  { label: "CRM", slug: "crm", icon: Contact, group: "grow" },
  { label: "Commerce", slug: "commerce", icon: ShoppingCart, group: "grow" },
  { label: "AI", slug: "ai", icon: Sparkles, group: "grow" },
  { label: "Analytics", slug: "analytics", icon: BarChart3, group: "grow" },
  { label: "Marketplace", slug: "marketplace", icon: Store, group: "grow" },

  { label: "Assets", slug: "assets", icon: Image, group: "system" },
  { label: "Users", slug: "users", icon: UserCog, group: "system" },
  { label: "Settings", slug: "settings", icon: Settings, group: "system" },
];

export const GROUP_LABELS: Record<NavItem["group"], string> = {
  workspace: "Workspace",
  build: "Build",
  data: "Data & Logic",
  grow: "Grow",
  system: "System",
};

export const navBySlug = (slug: string) => NAV.find((n) => n.slug === slug);
