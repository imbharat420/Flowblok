// Service layer — business logic: filtering, search, derived stats.
// Knows nothing about HTTP. Pure, testable, reusable from API routes or RSC.

import {
  UsersRepository,
  usersRepository,
  type CreateUserInput,
  type UpdateUserPatch,
} from "./users.repository";
import type { Role, User, UserStatus } from "@/lib/types";

export interface UsersQuery {
  search?: string;
  role?: Role;
  status?: UserStatus;
}

export class UsersService {
  constructor(private readonly repo: UsersRepository = usersRepository) {}

  list(query: UsersQuery = {}): User[] {
    let items = this.repo.findAll();

    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    if (query.role) items = items.filter((u) => u.role === query.role);
    if (query.status) items = items.filter((u) => u.status === query.status);

    // Active first, then most-recently-active; never-active (invited) sink to the bottom.
    return [...items].sort((a, b) => (b.lastActive ?? "").localeCompare(a.lastActive ?? ""));
  }

  getById(id: string): User | null {
    return this.repo.findById(id) ?? null;
  }

  invite(input: CreateUserInput): User {
    return this.repo.create(input);
  }

  updateUser(id: string, patch: UpdateUserPatch): User | null {
    return this.repo.update(id, patch) ?? null;
  }

  /** counts by status — feeds the members KPI strip */
  statusBreakdown(): Record<UserStatus, number> {
    return this.repo.findAll().reduce<Record<UserStatus, number>>(
      (acc, u) => {
        acc[u.status] += 1;
        return acc;
      },
      { active: 0, invited: 0, suspended: 0 },
    );
  }

  /** counts by role — feeds the Roles tab summary */
  roleBreakdown(): Record<Role, number> {
    return this.repo.findAll().reduce<Record<Role, number>>(
      (acc, u) => {
        acc[u.role] = (acc[u.role] ?? 0) + 1;
        return acc;
      },
      {} as Record<Role, number>,
    );
  }

  total(): number {
    return this.repo.findAll().length;
  }
}

export const usersService = new UsersService();
