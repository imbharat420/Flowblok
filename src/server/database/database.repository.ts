// Repository layer — owns its in-memory seed array. Swap for Prisma/Supabase
// without touching the service or controller.

import type { DbTable } from "./database.types";

// Cleared: no demo tables. Users define their own data tables.
const tables: DbTable[] = [];

export class DatabaseRepository {
  findAll(): DbTable[] {
    return tables;
  }

  findById(id: string): DbTable | undefined {
    return tables.find((t) => t.id === id);
  }
}

export const databaseRepository = new DatabaseRepository();
