// Database seeder. Creates two accounts and (for the demo account) 24 fully
// populated niche "sites" — each with pages, content, workflows and credentials,
// all space-scoped. Idempotent: niches are only seeded once per account.
//
//   • empty@flowblok.dev  — the TEST account: verified, zero spaces / data.
//   • demo@flowblok.dev   — the SEEDED account: 24 niche spaces, fully built.
//
// Relative imports only (no "@/" value imports) so a standalone CLI (scripts/
// seed.ts via tsx) can run it outside the Next runtime.

import { randomUUID } from "node:crypto";
import { count, eq } from "drizzle-orm";
import { getDb, runMigrations } from "./client";
import { users, spaces, stories, storyVersions, workflows, workflowRuns, credentials, schedulerState } from "./schema";
import { encryptBag } from "./encryption";
import { hashPassword } from "../auth/password";
import { NICHE_SPECS, generateSpace } from "./niche-templates";
import type { AppDb } from "./client";

const DEMO_EMAIL = (process.env.SEED_DEMO_EMAIL || "demo@flowblok.dev").toLowerCase();
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || "flowblok-demo-2026";
const EMPTY_EMAIL = (process.env.SEED_EMPTY_EMAIL || "empty@flowblok.dev").toLowerCase();
const EMPTY_PASSWORD = process.env.SEED_EMPTY_PASSWORD || "flowblok-empty-2026";
const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || "admin@flowblok.dev").toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "flowblok-admin-2026";

const sid = (p: string) => p + "_" + randomUUID().slice(0, 12);

async function ensureUser(
  db: AppDb,
  input: { email: string; password: string; name: string; role?: string },
): Promise<string> {
  const email = input.email.toLowerCase();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) return existing[0].id;
  const id = randomUUID();
  await db.insert(users).values({
    id,
    email,
    passwordHash: hashPassword(input.password),
    name: input.name,
    role: input.role ?? "owner",
    verified: true,
    username: email.split("@")[0],
    firstName: input.name.split(" ")[0] ?? input.name,
    lastName: input.name.split(" ").slice(1).join(" ") || null,
  });
  return id;
}

// Delete all workspace DATA (spaces + everything under them) but KEEP accounts.
async function purgeData(db: AppDb): Promise<void> {
  // Child-first order (also covered by FK cascades, but explicit is robust).
  await db.delete(storyVersions);
  await db.delete(stories);
  await db.delete(workflowRuns);
  await db.delete(workflows);
  await db.delete(credentials);
  await db.delete(schedulerState);
  await db.delete(spaces);
}

// Full wipe — data AND accounts.
async function wipe(db: AppDb): Promise<void> {
  await purgeData(db);
  await db.delete(users);
}

/** Materialize all 24 niche spaces for an owner. */
async function seedNiches(db: AppDb, ownerId: string): Promise<{ spaces: number; stories: number; workflows: number }> {
  let nStories = 0;
  let nWorkflows = 0;
  for (const spec of NICHE_SPECS) {
    const spaceId = sid("spc");
    await db.insert(spaces).values({
      id: spaceId,
      ownerId,
      name: spec.name,
      slug: spec.key,
      niche: spec.niche,
      plan: spec.plan,
      members: 1 + (spec.workflows.length % 5),
    });

    const gen = generateSpace(spec);
    if (gen.stories.length) {
      await db.insert(stories).values(
        gen.stories.map((s) => ({
          id: sid("st"),
          spaceId,
          name: s.name,
          slug: s.slug,
          contentType: s.contentType,
          status: s.status,
          folder: s.folder,
          author: spec.name,
          content: s.content,
        })),
      );
      nStories += gen.stories.length;
    }
    if (gen.workflows.length) {
      await db.insert(workflows).values(
        gen.workflows.map((w) => ({
          id: sid("wf"),
          name: w.name,
          status: w.status,
          nodes: w.nodes,
          connections: w.connections,
          spaceId,
          ownerId,
        })),
      );
      nWorkflows += gen.workflows.length;
    }
    if (gen.credentials.length) {
      await db.insert(credentials).values(
        gen.credentials.map((c) => ({
          id: sid("cred"),
          name: c.name,
          type: c.type,
          dataEnc: encryptBag(c.data),
          spaceId,
        })),
      );
    }
  }
  return { spaces: NICHE_SPECS.length, stories: nStories, workflows: nWorkflows };
}

export async function seedDatabase(opts: { reset?: boolean; purge?: boolean } = {}): Promise<void> {
  await runMigrations();
  const db = await getDb();

  if (opts.reset || process.env.SEED_RESET === "1") {
    console.log("[seed] reset: wiping ALL data and accounts");
    await wipe(db);
  } else if (opts.purge || process.env.SEED_PURGE === "1") {
    console.log("[seed] purge: clearing all workspace data (accounts kept)");
    await purgeData(db);
  }

  // Always ensure the accounts exist so login works.
  await ensureUser(db, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: "Flowblok Admin" });
  await ensureUser(db, { email: EMPTY_EMAIL, password: EMPTY_PASSWORD, name: "Empty Account" });
  const demoId = await ensureUser(db, { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: "Demo Owner" });
  console.log(`[seed] accounts ready: ${ADMIN_EMAIL}, ${EMPTY_EMAIL}, ${DEMO_EMAIL}`);

  // Demo niche data is OPT-IN (SEED_DEMO=1). Default boot/seed creates no data.
  if (process.env.SEED_DEMO === "1") {
    const [{ c: spaceCount }] = await db.select({ c: count() }).from(spaces).where(eq(spaces.ownerId, demoId));
    if (Number(spaceCount) === 0) {
      const r = await seedNiches(db, demoId);
      console.log(`[seed] SEED_DEMO=1 → demo account: ${r.spaces} niche spaces, ${r.stories} stories, ${r.workflows} workflows`);
    } else {
      console.log(`[seed] demo account already has ${Number(spaceCount)} spaces — skipping niche seed`);
    }
  } else {
    console.log("[seed] SEED_DEMO not set — accounts only, no demo data seeded");
  }
}
