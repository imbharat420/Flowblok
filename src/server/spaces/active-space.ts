// Resolves the current account (owner) and the active space from the request.
// The active space is the `fb_space` cookie, validated against the owner's own
// (non-archived) spaces; falls back to the owner's newest space.

import { cookies } from "next/headers";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getSession } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { spaces } from "@/server/db/schema";

export const SPACE_COOKIE = "fb_space";

export async function getOwnerId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}

/** The active space id for the current owner, or null if they have none. */
export async function getActiveSpaceId(): Promise<string | null> {
  const ownerId = await getOwnerId();
  if (!ownerId) return null;
  const db = await getDb();
  const owned = await db
    .select({ id: spaces.id })
    .from(spaces)
    .where(and(eq(spaces.ownerId, ownerId), isNull(spaces.archivedAt)))
    .orderBy(desc(spaces.createdAt));
  if (!owned.length) return null;
  const store = await cookies();
  const cookieId = store.get(SPACE_COOKIE)?.value;
  if (cookieId && owned.some((o) => o.id === cookieId)) return cookieId;
  return owned[0].id;
}
