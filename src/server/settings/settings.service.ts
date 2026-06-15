// Service layer — business logic for the Settings module. Knows nothing about
// HTTP. Pure and reusable from API routes, RSC, or workflows.

import { SettingsRepository, settingsRepository } from "./settings.repository";
import type {
  DeveloperToggle,
  DomainEntry,
  PlanCard,
  SettingsSnapshot,
  SpaceGeneral,
} from "./settings.types";

const HOST_RE = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

export class SettingsService {
  constructor(private readonly repo: SettingsRepository = settingsRepository) {}

  /** Everything a settings page needs in one call. */
  snapshot(): SettingsSnapshot {
    return {
      general: this.repo.getGeneral(),
      plans: this.repo.listPlans(),
      domains: this.repo.listDomains(),
      toggles: this.repo.listToggles(),
    };
  }

  general(): SpaceGeneral {
    return this.repo.getGeneral();
  }

  updateGeneral(patch: Partial<SpaceGeneral>): SpaceGeneral {
    return this.repo.updateGeneral(patch);
  }

  plans(): PlanCard[] {
    return this.repo.listPlans();
  }

  domains(): DomainEntry[] {
    return this.repo.listDomains();
  }

  isValidHost(host: string): boolean {
    return HOST_RE.test(host.trim());
  }

  addDomain(host: string): DomainEntry | null {
    const clean = host.trim().toLowerCase();
    if (!this.isValidHost(clean)) return null;
    if (this.repo.listDomains().some((d) => d.host === clean)) return null;
    return this.repo.addDomain(clean);
  }

  toggles(): DeveloperToggle[] {
    return this.repo.listToggles();
  }

  setToggle(id: string, enabled: boolean): DeveloperToggle | null {
    return this.repo.setToggle(id, enabled) ?? null;
  }
}

export const settingsService = new SettingsService();
