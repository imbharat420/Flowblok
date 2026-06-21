// Standalone seed CLI: `npm run seed` (or `npm run seed -- --reset`).
// Loads .env first so it targets the SAME database/secret as the Next app
// (DATABASE_URL when set, else embedded PGlite in ./.data).
import { readFileSync } from "node:fs";

// Minimal .env loader (no dependency). Must run before importing the seed
// module so CRED_SECRET / DATABASE_URL are read by the import chain.
function loadEnv(file: string) {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return;
  }
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    if (process.env[key]) continue;
    process.env[key] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv(".env.local");
loadEnv(".env");

const reset = process.argv.includes("--reset");
const purge = process.argv.includes("--purge");

(async () => {
  // Dynamic import AFTER env is loaded so the import chain reads CRED_SECRET etc.
  const { seedDatabase } = await import("../src/server/db/seed");
  await seedDatabase({ reset, purge });
})()
  .then(() => {
    console.log("[seed] complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  });
