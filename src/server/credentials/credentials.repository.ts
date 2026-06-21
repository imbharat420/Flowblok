// Credentials data source (Postgres/Drizzle). Secret bags are encrypted at rest
// (AES-256-GCM); the repository decrypts on read so callers still receive a
// plain Record<string,string>. Masking remains a controller concern.

import type { Credential, CreateCredentialInput, UpdateCredentialInput } from "./credentials.types";
import { getDb } from "@/server/db/client";
import { credentials as credTable } from "@/server/db/schema";
import { encryptBag, decryptBag } from "@/server/db/encryption";
import { eq, desc, inArray } from "drizzle-orm";

// Seeded on first boot (see src/server/db/seed.ts). Example placeholders only.
export const SEED_CREDENTIALS: Credential[] = [
  {
    id: "cred_anthropic",
    name: "Anthropic (production)",
    type: "anthropic",
    createdAt: "2026-05-02T10:15:00Z",
    data: { apiKey: "sk-ant-api03-EXAMPLE-do-not-use-1234567890ab" },
  },
  {
    id: "cred_slack_sales",
    name: "Slack — #sales bot",
    type: "slack",
    createdAt: "2026-05-18T14:30:00Z",
    data: { botToken: "xoxb-EXAMPLE-0987654321-abcdef" },
  },
];

type CredRow = typeof credTable.$inferSelect;
function rowToCred(r: CredRow): Credential {
  return {
    id: r.id,
    name: r.name,
    type: r.type as Credential["type"],
    createdAt: new Date(r.createdAt).toISOString(),
    data: decryptBag(r.dataEnc),
  };
}

export class CredentialsRepository {
  async findAllForSpace(spaceId: string): Promise<Credential[]> {
    const db = await getDb();
    const rows = await db
      .select()
      .from(credTable)
      .where(eq(credTable.spaceId, spaceId))
      .orderBy(desc(credTable.createdAt));
    return rows.map(rowToCred);
  }

  async findById(id: string): Promise<Credential | undefined> {
    const db = await getDb();
    const rows = await db.select().from(credTable).where(eq(credTable.id, id)).limit(1);
    return rows[0] ? rowToCred(rows[0]) : undefined;
  }

  // Fetch (and decrypt) only the referenced credentials — used by the engine so
  // a run doesn't scan + decrypt every stored secret.
  async findByIds(ids: string[]): Promise<Credential[]> {
    if (!ids.length) return [];
    const db = await getDb();
    const rows = await db.select().from(credTable).where(inArray(credTable.id, ids));
    return rows.map(rowToCred);
  }

  async create(input: CreateCredentialInput, spaceId?: string | null): Promise<Credential> {
    const db = await getDb();
    const [row] = await db
      .insert(credTable)
      .values({
        id: "cred_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        name: input.name,
        type: input.type,
        dataEnc: encryptBag(input.data),
        spaceId: spaceId ?? null,
      })
      .returning();
    return rowToCred(row);
  }

  async update(id: string, patch: UpdateCredentialInput): Promise<Credential | undefined> {
    const db = await getDb();
    const set: Partial<CredRow> = {};
    if (patch.name !== undefined) set.name = patch.name;
    if (patch.type !== undefined) set.type = patch.type;
    // Replace the whole secret bag when provided — partial merges leave stale keys.
    if (patch.data !== undefined) set.dataEnc = encryptBag(patch.data);
    if (Object.keys(set).length === 0) return this.findById(id);
    const [row] = await db.update(credTable).set(set).where(eq(credTable.id, id)).returning();
    return row ? rowToCred(row) : undefined;
  }

  async remove(id: string): Promise<Credential | undefined> {
    const db = await getDb();
    const [row] = await db.delete(credTable).where(eq(credTable.id, id)).returning();
    return row ? rowToCred(row) : undefined;
  }
}

export const credentialsRepository = new CredentialsRepository();
