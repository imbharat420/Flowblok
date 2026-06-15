// Service layer — business logic: pipeline grouping, roll-ups, derived KPIs.
// Knows nothing about HTTP. Pure, testable, reusable from API routes or RSC.

import { CrmRepository, crmRepository } from "./crm.repository";
import { DEAL_STAGES } from "./crm.types";
import type { Activity, Company, Contact, Deal, PipelineColumn } from "./crm.types";

export interface CrmKpis {
  openDeals: number;
  pipelineValue: number;
  wonValue: number;
  contacts: number;
}

export class CrmService {
  constructor(private readonly repo: CrmRepository = crmRepository) {}

  /** Deals grouped into the 5 ordered stages, each with count + summed value. */
  pipeline(): PipelineColumn[] {
    const all = this.repo.findDeals();
    return DEAL_STAGES.map((stage) => {
      const deals = all.filter((d) => d.stage === stage);
      return {
        stage,
        count: deals.length,
        value: deals.reduce((sum, d) => sum + d.value, 0),
        deals,
      };
    });
  }

  deals(): Deal[] {
    return this.repo.findDeals();
  }

  contacts(): Contact[] {
    return [...this.repo.findContacts()].sort((a, b) => a.name.localeCompare(b.name));
  }

  companies(): Company[] {
    return [...this.repo.findCompanies()].sort((a, b) => a.name.localeCompare(b.name));
  }

  activities(): Activity[] {
    return [...this.repo.findActivities()].sort((a, b) => b.when.localeCompare(a.when));
  }

  /** Top-of-page KPIs. "Won" excluded from open deals/pipeline value. */
  kpis(): CrmKpis {
    const deals = this.repo.findDeals();
    const open = deals.filter((d) => d.stage !== "Won");
    const won = deals.filter((d) => d.stage === "Won");
    return {
      openDeals: open.length,
      pipelineValue: open.reduce((sum, d) => sum + d.value, 0),
      wonValue: won.reduce((sum, d) => sum + d.value, 0),
      contacts: this.repo.findContacts().length,
    };
  }
}

export const crmService = new CrmService();
