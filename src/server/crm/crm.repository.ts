// Repository layer — owns its in-memory seed data. The ONLY layer that touches
// the data source. Swap these arrays for Prisma/Supabase without touching
// the service or controller.

import type { Activity, Company, Contact, Deal, DealStage } from "./crm.types";

// Cleared: CRM starts empty. Records are created at runtime via the API.
const deals: Deal[] = [];
const contacts: Contact[] = [];
const companies: Company[] = [];
const activities: Activity[] = [];

export class CrmRepository {
  findDeals(): Deal[] {
    return deals;
  }

  findContacts(): Contact[] {
    return contacts;
  }

  findCompanies(): Company[] {
    return companies;
  }

  findActivities(): Activity[] {
    return activities;
  }

  createDeal(input: { name: string; company: string; value: number; stage?: DealStage }): Deal {
    const deal: Deal = {
      id: `d_${deals.length + 1}`,
      name: input.name,
      company: input.company,
      value: input.value,
      stage: input.stage ?? "New Lead",
    };
    deals.push(deal);
    return deal;
  }

  moveDeal(id: string, stage: DealStage): Deal | undefined {
    const idx = deals.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    deals[idx] = { ...deals[idx], stage };
    return deals[idx];
  }
}

export const crmRepository = new CrmRepository();
