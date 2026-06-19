// Credentials data source. Holds raw (plaintext) secret values — masking is a
// concern of the controller, never the repository.

import type {
  Credential,
  CreateCredentialInput,
  UpdateCredentialInput,
} from "./credentials.types";

const SEED_CREDENTIALS: Credential[] = [
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

// Pin the mutable list on globalThis. In Next.js dev, each route-handler file is
// a separate bundle that would otherwise hold its own copy of a plain
// module-level array — so a credential created via one route wouldn't be seen by
// another. A single global array keeps create/update/remove consistent across
// every route handler and survives HMR re-evaluation.
const globalStore = globalThis as unknown as { __flowblokCredentials?: Credential[] };
const CREDENTIALS: Credential[] = (globalStore.__flowblokCredentials ??= SEED_CREDENTIALS);

export class CredentialsRepository {
  findAll(): Credential[] {
    return CREDENTIALS;
  }

  findById(id: string): Credential | undefined {
    return CREDENTIALS.find((c) => c.id === id);
  }

  create(input: CreateCredentialInput): Credential {
    const cred: Credential = {
      id: "cred_" + Date.now().toString(36),
      name: input.name,
      type: input.type,
      createdAt: new Date().toISOString(),
      data: { ...input.data },
    };
    CREDENTIALS.unshift(cred);
    return cred;
  }

  update(id: string, patch: UpdateCredentialInput): Credential | undefined {
    const idx = CREDENTIALS.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const current = CREDENTIALS[idx];
    CREDENTIALS[idx] = {
      ...current,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.type !== undefined ? { type: patch.type } : {}),
      // Replace the whole secret bag when provided — partial merges would leave
      // stale keys behind.
      ...(patch.data !== undefined ? { data: { ...patch.data } } : {}),
    };
    return CREDENTIALS[idx];
  }

  remove(id: string): Credential | undefined {
    const idx = CREDENTIALS.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const [removed] = CREDENTIALS.splice(idx, 1);
    return removed;
  }
}

export const credentialsRepository = new CredentialsRepository();
