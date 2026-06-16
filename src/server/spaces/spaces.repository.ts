// Repository layer — the ONLY layer that talks to the data source.
// Holds its own in-memory seed array. Swap for Prisma/Supabase without
// touching the service or controller.

import type { CreateSpaceInput, Space } from "./spaces.types";

const ARCHIVE_DAYS = 30;

const spaces: Space[] = [
  {
    id: "spc_acme_digital",
    name: "Acme Digital",
    plan: "Enterprise",
    status: "active",
    members: 48,
    region: "us-east-1",
    createdAt: "2023-02-14T09:12:00.000Z",
  },
  {
    id: "spc_northwind_mktg",
    name: "Northwind Marketing",
    plan: "Business",
    status: "active",
    members: 22,
    region: "eu-west-1",
    createdAt: "2023-06-30T14:05:00.000Z",
  },
  {
    id: "spc_globex_docs",
    name: "Globex Docs",
    plan: "Professional",
    status: "active",
    members: 11,
    region: "us-west-2",
    createdAt: "2024-01-09T11:40:00.000Z",
  },
  {
    id: "spc_initech_labs",
    name: "Initech Labs",
    plan: "Starter",
    status: "paused",
    members: 3,
    region: "ap-southeast-1",
    createdAt: "2024-03-22T08:00:00.000Z",
  },
  {
    id: "spc_umbrella_store",
    name: "Umbrella Store",
    plan: "Business",
    status: "active",
    members: 19,
    region: "eu-central-1",
    createdAt: "2024-05-18T16:25:00.000Z",
  },
  {
    id: "spc_hooli_internal",
    name: "Hooli Internal",
    plan: "Enterprise",
    status: "active",
    members: 67,
    region: "us-east-1",
    createdAt: "2022-11-01T10:30:00.000Z",
  },
  {
    id: "spc_soylent_blog",
    name: "Soylent Blog",
    plan: "Starter",
    status: "paused",
    members: 2,
    region: "us-west-2",
    createdAt: "2024-09-12T13:15:00.000Z",
  },
  {
    id: "spc_wayne_press",
    name: "Wayne Press",
    plan: "Professional",
    status: "active",
    members: 14,
    region: "ap-northeast-1",
    createdAt: "2025-01-27T07:55:00.000Z",
  },
];

export class SpacesRepository {
  findAll(): Space[] {
    return spaces;
  }

  findById(id: string): Space | undefined {
    return spaces.find((s) => s.id === id);
  }

  create(input: CreateSpaceInput): Space {
    const space: Space = {
      id: "spc_" + input.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 28) + "_" + (spaces.length + 1),
      name: input.name,
      plan: input.plan ?? "Starter",
      status: "active",
      members: 1,
      region: input.region ?? "us-east-1",
      createdAt: new Date().toISOString(),
      archivedAt: null,
      purgeAt: null,
    };
    spaces.unshift(space);
    return space;
  }

  archive(id: string): Space | undefined {
    const s = this.findById(id);
    if (!s) return undefined;
    const now = new Date();
    s.archivedAt = now.toISOString();
    s.purgeAt = new Date(now.getTime() + ARCHIVE_DAYS * 86400000).toISOString();
    return s;
  }

  restore(id: string): Space | undefined {
    const s = this.findById(id);
    if (!s) return undefined;
    s.archivedAt = null;
    s.purgeAt = null;
    return s;
  }
}

export const spacesRepository = new SpacesRepository();
