// Repository layer — the ONLY layer that talks to the data source.
// Holds its own in-memory seed of org members. Swap for Prisma/Supabase
// without touching the service or controller.

import type { Role, User, UserStatus } from "@/lib/types";

export interface CreateUserInput {
  name?: string;
  email: string;
  role: Role;
}

export interface UpdateUserPatch {
  role?: Role;
  status?: UserStatus;
}

// Avatar palette — cycled through when seeding invited members so new rows
// look consistent with the seed set above.
const AVATAR_COLORS = ["#7c5cff", "#22b8a6", "#3b82f6", "#e879a6", "#f59e0b", "#10b981", "#06b6d4"];

// Cleared: org member list starts empty. Invite teammates at runtime.
const users: User[] = [];

export class UsersRepository {
  findAll(): User[] {
    return users;
  }

  findById(id: string): User | undefined {
    return users.find((u) => u.id === id);
  }

  create(input: CreateUserInput): User {
    const n = users.length + 1;
    const user: User = {
      id: `usr_${String(n).padStart(2, "0")}`,
      name: input.name?.trim() || input.email.split("@")[0],
      email: input.email,
      role: input.role,
      status: "invited",
      avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
      lastActive: null,
    };
    users.push(user);
    return user;
  }

  update(id: string, patch: UpdateUserPatch): User | undefined {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    users[idx] = { ...users[idx], ...patch };
    return users[idx];
  }
}

export const usersRepository = new UsersRepository();
