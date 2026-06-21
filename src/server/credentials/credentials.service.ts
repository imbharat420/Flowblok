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

  async list(spaceId: string): Promise<Credential[]> {
    return spaceId ? this.repo.findAllForSpace(spaceId) : [];
  }

  async get(id: string): Promise<Credential | null> {
    return (await this.repo.findById(id)) ?? null;
  }

  async getByIds(ids: string[]): Promise<Credential[]> {
    return this.repo.findByIds(ids);
  }

  async create(input: CreateCredentialInput, spaceId?: string | null): Promise<Credential> {
    return this.repo.create(input, spaceId);
  }

  async update(id: string, input: UpdateCredentialInput): Promise<Credential | null> {
    return (await this.repo.update(id, input)) ?? null;
  }

  async remove(id: string): Promise<Credential | null> {
    return (await this.repo.remove(id)) ?? null;
  }
}

export const credentialsService = new CredentialsService();
