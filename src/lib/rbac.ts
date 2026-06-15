// RBAC engine — the single source of truth for "who can do what".
// DRY: every surface (sidebar, page guards, action buttons) calls `can()`.
// KISS: a flat role → capability matrix; "owner" is the super admin (all caps).

import type { Capability, Role } from "@/lib/types";

export const ROLES: Role[] = ["owner", "admin", "manager", "developer", "editor", "viewer"];

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner · Super Admin",
  admin: "Admin",
  manager: "Manager",
  developer: "Developer",
  editor: "Editor",
  viewer: "Viewer",
};

export const ALL_CAPABILITIES: Capability[] = [
  "view_dashboard",
  "manage_spaces",
  "edit_content",
  "edit_components",
  "edit_data",
  "manage_workflows",
  "manage_apis",
  "manage_crm",
  "manage_commerce",
  "use_ai",
  "view_analytics",
  "manage_marketplace",
  "manage_assets",
  "manage_users",
  "manage_settings",
  "manage_billing",
  "use_developer_mode",
];

// "all" === super admin. Everyone else gets an explicit allow-list.
const MATRIX: Record<Role, Capability[] | "all"> = {
  owner: "all",
  admin: ALL_CAPABILITIES.filter((c) => c !== "manage_billing"),
  manager: [
    "view_dashboard",
    "edit_content",
    "edit_components",
    "manage_crm",
    "manage_commerce",
    "view_analytics",
    "manage_assets",
    "use_ai",
    "manage_marketplace",
  ],
  developer: [
    "view_dashboard",
    "edit_content",
    "edit_components",
    "edit_data",
    "manage_workflows",
    "manage_apis",
    "use_developer_mode",
    "use_ai",
  ],
  editor: ["view_dashboard", "edit_content", "edit_components", "manage_assets", "use_ai"],
  viewer: ["view_dashboard", "view_analytics"],
};

export function isSuperAdmin(role: Role): boolean {
  return MATRIX[role] === "all";
}

export function can(role: Role, capability: Capability): boolean {
  const allowed = MATRIX[role];
  return allowed === "all" || allowed.includes(capability);
}

export function capabilitiesOf(role: Role): Capability[] {
  const allowed = MATRIX[role];
  return allowed === "all" ? [...ALL_CAPABILITIES] : allowed;
}
