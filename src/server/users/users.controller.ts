// Controller layer — maps HTTP concerns (query parsing, status codes, shapes)
// to service calls. Next.js route handlers are thin adapters that delegate here.

import { UsersService, usersService, type UsersQuery } from "./users.service";
import { ROLES } from "@/lib/rbac";
import type { ApiResult } from "@/server/content/content.controller";
import type { Role, UserStatus } from "@/lib/types";

const STATUSES: UserStatus[] = ["active", "invited", "suspended"];

export class UsersController {
  constructor(private readonly service: UsersService = usersService) {}

  // GET /api/users
  list(searchParams: URLSearchParams): ApiResult {
    const roleParam = searchParams.get("role");
    const statusParam = searchParams.get("status");

    const query: UsersQuery = {
      search: searchParams.get("search") ?? undefined,
      role: ROLES.includes(roleParam as Role) ? (roleParam as Role) : undefined,
      status: STATUSES.includes(statusParam as UserStatus)
        ? (statusParam as UserStatus)
        : undefined,
    };

    const items = this.service.list(query);
    return {
      status: 200,
      body: {
        items,
        total: this.service.total(),
        meta: {
          statusBreakdown: this.service.statusBreakdown(),
          roleBreakdown: this.service.roleBreakdown(),
        },
      },
    };
  }

  // GET /api/users/:id
  getById(id: string): ApiResult {
    const user = this.service.getById(id);
    if (!user) return { status: 404, body: { error: "User not found", id } };
    return { status: 200, body: user };
  }

  // POST /api/users — invite a new member
  create(body: unknown): ApiResult {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid body" } };
    }
    const { name, email, role } = body as Record<string, unknown>;

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { status: 400, body: { error: "A valid email is required" } };
    }
    if (!ROLES.includes(role as Role) || role === "owner") {
      return { status: 400, body: { error: "Invalid role" } };
    }

    const user = this.service.invite({
      name: typeof name === "string" ? name : undefined,
      email,
      role: role as Role,
    });
    return { status: 201, body: user };
  }

  // PUT /api/users/:id — change role and/or status
  update(id: string, body: unknown): ApiResult {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid body" } };
    }
    const { role, status } = body as Record<string, unknown>;
    const patch: { role?: Role; status?: UserStatus } = {};

    if (role !== undefined) {
      if (!ROLES.includes(role as Role)) return { status: 400, body: { error: "Invalid role" } };
      patch.role = role as Role;
    }
    if (status !== undefined) {
      if (!STATUSES.includes(status as UserStatus)) {
        return { status: 400, body: { error: "Invalid status" } };
      }
      patch.status = status as UserStatus;
    }
    if (patch.role === undefined && patch.status === undefined) {
      return { status: 400, body: { error: "Nothing to update" } };
    }

    const updated = this.service.updateUser(id, patch);
    if (!updated) return { status: 404, body: { error: "User not found", id } };
    return { status: 200, body: updated };
  }
}

export const usersController = new UsersController();
