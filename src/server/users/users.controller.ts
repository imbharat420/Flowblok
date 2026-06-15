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
}

export const usersController = new UsersController();
