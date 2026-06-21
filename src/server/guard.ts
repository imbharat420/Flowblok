// Server-side RBAC enforcement (layer 2 of the 3-layer model in 03-SECURITY-AND-ACCESS.md).
// Reads the active role from the fb_role cookie and checks it against the capability.
// Every mutating (POST/PUT/DELETE) route handler must call requireCapability().

import { cookies } from "next/headers";
import { can } from "@/lib/rbac";
import { getSession } from "@/server/auth/session";
import type { Capability, Role } from "@/lib/types";

const ROLES_SET = new Set<Role>(["owner", "admin", "manager", "developer", "editor", "viewer"]);

export async function currentRole(): Promise<Role> {
  // The fb_role cookie is the in-app role-preview override (top-bar switcher).
  const store = await cookies();
  const raw = store.get("fb_role")?.value as Role | undefined;
  if (raw && ROLES_SET.has(raw)) return raw;
  // Otherwise derive the role from the authenticated session.
  const session = await getSession();
  const role = session?.user.role as Role | undefined;
  return role && ROLES_SET.has(role) ? role : "viewer";
}

export type Gate = { ok: true; role: Role } | { ok: false; status: number; body: unknown };

export async function requireCapability(cap: Capability): Promise<Gate> {
  const role = await currentRole();
  if (can(role, cap)) return { ok: true, role };
  return {
    ok: false,
    status: 403,
    body: { error: "Forbidden", message: `Role "${role}" lacks capability "${cap}".`, capability: cap },
  };
}
