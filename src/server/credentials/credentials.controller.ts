// Controller layer — maps HTTP concerns to the service and, critically, MASKS
// every secret value before it leaves the server. List/get/create/update all
// return masked data; the raw plaintext only ever lives in the repository.

import { CredentialsService, credentialsService } from "./credentials.service";
import type { ApiResult } from "@/server/content/content.controller";
import type {
  Credential,
  CreateCredentialInput,
  CredentialType,
  UpdateCredentialInput,
} from "./credentials.types";

const CREDENTIAL_TYPES: CredentialType[] = [
  "api_key",
  "http_header",
  "smtp",
  "slack",
  "stripe",
  "anthropic",
];

/** Mask a single secret value: "••••" + last 2 chars (no plaintext prefix). */
function maskValue(value: string): string {
  const last = value.length >= 2 ? value.slice(-2) : "";
  return "••••" + last;
}

/** Return a credential with every data value masked (keys preserved). */
function maskCredential(cred: Credential): Credential {
  const masked: Record<string, string> = {};
  for (const [key, value] of Object.entries(cred.data)) {
    masked[key] = maskValue(value);
  }
  return { ...cred, data: masked };
}

function isStringRecord(v: unknown): v is Record<string, string> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  return Object.values(v as Record<string, unknown>).every((x) => typeof x === "string");
}

export class CredentialsController {
  constructor(private readonly service: CredentialsService = credentialsService) {}

  // GET /api/credentials
  list(): ApiResult {
    return { status: 200, body: { items: this.service.list().map(maskCredential) } };
  }

  // GET /api/credentials/:id
  getById(id: string): ApiResult {
    const cred = this.service.get(id);
    if (!cred) return { status: 404, body: { error: "Credential not found", id } };
    return { status: 200, body: maskCredential(cred) };
  }

  // POST /api/credentials
  create(body: unknown): ApiResult {
    if (!body || typeof body !== "object") return { status: 400, body: { error: "Invalid body" } };
    const { name, type, data } = body as Record<string, unknown>;

    if (typeof name !== "string" || !name.trim()) {
      return { status: 400, body: { error: "Name is required" } };
    }
    if (!CREDENTIAL_TYPES.includes(type as CredentialType)) {
      return { status: 400, body: { error: "Invalid credential type", allowed: CREDENTIAL_TYPES } };
    }
    if (!isStringRecord(data)) {
      return { status: 400, body: { error: "data must be an object of string values" } };
    }

    const input: CreateCredentialInput = {
      name: name.trim(),
      type: type as CredentialType,
      data,
    };
    return { status: 201, body: maskCredential(this.service.create(input)) };
  }

  // PUT /api/credentials/:id
  update(id: string, body: unknown): ApiResult {
    if (!body || typeof body !== "object") return { status: 400, body: { error: "Invalid body" } };
    const b = body as Record<string, unknown>;
    const patch: UpdateCredentialInput = {};

    if (b.name !== undefined) {
      if (typeof b.name !== "string" || !b.name.trim()) {
        return { status: 400, body: { error: "Name must be a non-empty string" } };
      }
      patch.name = b.name.trim();
    }
    if (b.type !== undefined) {
      if (!CREDENTIAL_TYPES.includes(b.type as CredentialType)) {
        return { status: 400, body: { error: "Invalid credential type", allowed: CREDENTIAL_TYPES } };
      }
      patch.type = b.type as CredentialType;
    }
    if (b.data !== undefined) {
      if (!isStringRecord(b.data)) {
        return { status: 400, body: { error: "data must be an object of string values" } };
      }
      patch.data = b.data;
    }

    const updated = this.service.update(id, patch);
    if (!updated) return { status: 404, body: { error: "Credential not found", id } };
    return { status: 200, body: maskCredential(updated) };
  }

  // DELETE /api/credentials/:id
  remove(id: string): ApiResult {
    const removed = this.service.remove(id);
    if (!removed) return { status: 404, body: { error: "Credential not found", id } };
    return { status: 200, body: { ok: true, id } };
  }
}

export const credentialsController = new CredentialsController();
