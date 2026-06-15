// Service layer — business logic over tables. Knows nothing about HTTP.

import { DatabaseRepository, databaseRepository } from "./database.repository";
import type { DbTable } from "./database.types";

export class DatabaseService {
  constructor(private readonly repo: DatabaseRepository = databaseRepository) {}

  list(): DbTable[] {
    return [...this.repo.findAll()].sort((a, b) => a.name.localeCompare(b.name));
  }

  getById(id: string): DbTable | null {
    return this.repo.findById(id) ?? null;
  }

  /** REST endpoints auto-generated for a table (Storyblok/Supabase-style). */
  endpoints(table: DbTable): Array<{ method: string; path: string; summary: string }> {
    const base = `/api/db/${table.name}`;
    return [
      { method: "GET", path: base, summary: `List ${table.name}` },
      { method: "POST", path: base, summary: `Create a ${table.name} record` },
      { method: "PUT", path: `${base}/{id}`, summary: `Update a ${table.name} record` },
      { method: "DELETE", path: `${base}/{id}`, summary: `Delete a ${table.name} record` },
    ];
  }
}

export const databaseService = new DatabaseService();
