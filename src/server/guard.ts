// Server-side RBAC enforcement (layer 2 of the 3-layer model in 03-SECURITY-AND-ACCESS.md).
// Reads the active role from the fb_role cookie and checks it against the capability.
// Every mutating (POST/PUT/DELETE) route handler must call requireCapability().

import { cookies } from "next/headers";
import { can } from "@/lib/rbac";
import type { Capability, Role } from "@/lib/types";

const ROLES_SET = new Set<Role>(["owner", "admin", "manager", "developer", "editor", "viewer"]);

export async function currentRole(): Promise<Role> {
  const store = await cookies();
  const raw = store.get("fb_role")?.value as Role | undefined;
  return raw && ROLES_SET.has(raw) ? raw : "owner";
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
