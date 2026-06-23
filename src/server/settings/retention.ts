// Single source of truth for the archive/bin retention period. Owned by the
// Settings module (configurable there) and read by the Spaces archive to decide
// each item's purge deadline. Memoized on globalThis so the value survives the
// per-request module re-evaluation Next.js does in dev.

import { RETENTION_OPTIONS } from "./settings.types";

const DEFAULT_DAYS = 30;
const ALLOWED = new Set(RETENTION_OPTIONS.map((o) => o.value));

type Holder = { __flowblokRetentionDays?: number };
const g = globalThis as unknown as Holder;

export function getRetentionDays(): number {
  return g.__flowblokRetentionDays ?? DEFAULT_DAYS;
}

export function setRetentionDays(days: number): number {
  if (ALLOWED.has(days)) g.__flowblokRetentionDays = days;
  return getRetentionDays();
}

// Purge deadline for an item archived at `fromMs`, or null for "Lifetime" (0).
export function purgeDateFrom(fromMs: number): string | null {
  const days = getRetentionDays();
  return days > 0 ? new Date(fromMs + days * 86400000).toISOString() : null;
}
