// Service layer — business logic for credentials. Knows nothing about HTTP and
// nothing about masking; it returns raw credentials. The controller is
// responsible for masking secrets before they leave the server.

import { CredentialsRepository, credentialsRepository } from "./credentials.repository";
import type {
  Credential,
  CreateCredentialInput,
  UpdateCredentialInput,
} from "./credentials.types";

export class CredentialsService {
  constructor(private readonly repo: CredentialsRepository = credentialsRepository) {}

  list(): Credential[] {
    return [...this.repo.findAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  get(id: string): Credential | null {
    return this.repo.findById(id) ?? null;
  }

  create(input: CreateCredentialInput): Credential {
    return this.repo.create(input);
  }

  update(id: string, input: UpdateCredentialInput): Credential | null {
    return this.repo.update(id, input) ?? null;
  }

  remove(id: string): Credential | null {
    return this.repo.remove(id) ?? null;
  }
}

export const credentialsService = new CredentialsService();
