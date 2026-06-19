// Credential types for the workflow engine. A credential holds named secret
// values (data) of a given type, referenced by id from workflow node configs.

export type CredentialType =
  | "api_key"
  | "http_header"
  | "smtp"
  | "slack"
  | "stripe"
  | "anthropic";

export interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  createdAt: string;
  /** Secret key/value pairs (e.g. { apiKey: "sk-..." }). Stored plaintext server-side. */
  data: Record<string, string>;
}

export interface CreateCredentialInput {
  name: string;
  type: CredentialType;
  data: Record<string, string>;
}

export interface UpdateCredentialInput {
  name?: string;
  type?: CredentialType;
  data?: Record<string, string>;
}

/** A credential whose secret values are masked — safe to return over the API. */
export type MaskedCredential = Credential;
