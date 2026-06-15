// Repository layer — the ONLY layer that talks to the data source.
// Holds its own in-memory seed of org members. Swap for Prisma/Supabase
// without touching the service or controller.

import type { User } from "@/lib/types";

const users: User[] = [
  {
    id: "usr_01",
    name: "Dharamraj Nagar",
    email: "dharamraj.nagar@dotsquares.com",
    role: "owner",
    status: "active",
    avatarColor: "#7c5cff",
    lastActive: "2026-06-16T08:42:00.000Z",
  },
  {
    id: "usr_02",
    name: "Mara Whitfield",
    email: "mara.whitfield@acmedigital.com",
    role: "admin",
    status: "active",
    avatarColor: "#22b8a6",
    lastActive: "2026-06-16T07:15:00.000Z",
  },
  {
    id: "usr_03",
    name: "Tobias Lindqvist",
    email: "tobias.lindqvist@acmedigital.com",
    role: "admin",
    status: "active",
    avatarColor: "#3b82f6",
    lastActive: "2026-06-15T18:30:00.000Z",
  },
  {
    id: "usr_04",
    name: "Priya Raman",
    email: "priya.raman@acmedigital.com",
    role: "manager",
    status: "active",
    avatarColor: "#e879a6",
    lastActive: "2026-06-15T21:05:00.000Z",
  },
  {
    id: "usr_05",
    name: "Diego Fuentes",
    email: "diego.fuentes@acmedigital.com",
    role: "developer",
    status: "active",
    avatarColor: "#f59e0b",
    lastActive: "2026-06-16T06:58:00.000Z",
  },
  {
    id: "usr_06",
    name: "Hannah Brooks",
    email: "hannah.brooks@acmedigital.com",
    role: "developer",
    status: "active",
    avatarColor: "#10b981",
    lastActive: "2026-06-14T11:20:00.000Z",
  },
  {
    id: "usr_07",
    name: "Kenji Nakamura",
    email: "kenji.nakamura@acmedigital.com",
    role: "editor",
    status: "active",
    avatarColor: "#ef4444",
    lastActive: "2026-06-15T14:47:00.000Z",
  },
  {
    id: "usr_08",
    name: "Sofia Almeida",
    email: "sofia.almeida@acmedigital.com",
    role: "editor",
    status: "active",
    avatarColor: "#a855f7",
    lastActive: "2026-06-16T05:33:00.000Z",
  },
  {
    id: "usr_09",
    name: "Lucas Meyer",
    email: "lucas.meyer@acmedigital.com",
    role: "editor",
    status: "invited",
    avatarColor: "#06b6d4",
    lastActive: null,
  },
  {
    id: "usr_10",
    name: "Aisha Khan",
    email: "aisha.khan@acmedigital.com",
    role: "viewer",
    status: "active",
    avatarColor: "#84cc16",
    lastActive: "2026-06-13T09:12:00.000Z",
  },
  {
    id: "usr_11",
    name: "Noah Bergström",
    email: "noah.bergstrom@partner.acme.com",
    role: "viewer",
    status: "invited",
    avatarColor: "#f97316",
    lastActive: null,
  },
  {
    id: "usr_12",
    name: "Elena Rossi",
    email: "elena.rossi@acmedigital.com",
    role: "manager",
    status: "suspended",
    avatarColor: "#64748b",
    lastActive: "2026-05-28T16:40:00.000Z",
  },
];

export class UsersRepository {
  findAll(): User[] {
    return users;
  }

  findById(id: string): User | undefined {
    return users.find((u) => u.id === id);
  }
}

export const usersRepository = new UsersRepository();
