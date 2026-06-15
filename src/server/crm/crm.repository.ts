// Repository layer — owns its in-memory seed data. The ONLY layer that touches
// the data source. Swap these arrays for Prisma/Supabase without touching
// the service or controller.

import type { Activity, Company, Contact, Deal } from "./crm.types";

const deals: Deal[] = [
  { id: "d-1", name: "Website redesign", value: 48000, company: "Northwind Labs", stage: "New Lead" },
  { id: "d-2", name: "Mobile app build", value: 96000, company: "Helios Retail", stage: "New Lead" },
  { id: "d-3", name: "SEO retainer", value: 24000, company: "Brightwave Media", stage: "New Lead" },
  { id: "d-4", name: "Headless CMS migration", value: 72000, company: "Acme Digital", stage: "Qualified" },
  { id: "d-5", name: "Analytics dashboard", value: 36000, company: "Vertex Logistics", stage: "Qualified" },
  { id: "d-6", name: "Brand refresh", value: 28000, company: "Coastline Foods", stage: "Meeting" },
  { id: "d-7", name: "E-commerce replatform", value: 130000, company: "Helios Retail", stage: "Meeting" },
  { id: "d-8", name: "Marketing automation", value: 54000, company: "Brightwave Media", stage: "Proposal" },
  { id: "d-9", name: "Design system", value: 62000, company: "Northwind Labs", stage: "Proposal" },
  { id: "d-10", name: "Annual support plan", value: 40000, company: "Vertex Logistics", stage: "Won" },
  { id: "d-11", name: "Landing page sprint", value: 18000, company: "Coastline Foods", stage: "Won" },
  { id: "d-12", name: "API integration", value: 45000, company: "Acme Digital", stage: "Won" },
];

const contacts: Contact[] = [
  { id: "c-1", name: "Priya Nair", email: "priya.nair@northwindlabs.com", company: "Northwind Labs", title: "VP Engineering" },
  { id: "c-2", name: "Marcus Hale", email: "marcus@heliosretail.com", company: "Helios Retail", title: "Head of Digital" },
  { id: "c-3", name: "Lena Brandt", email: "lena.brandt@brightwave.io", company: "Brightwave Media", title: "Marketing Director" },
  { id: "c-4", name: "Tomás Rivera", email: "trivera@acmedigital.com", company: "Acme Digital", title: "CTO" },
  { id: "c-5", name: "Aisha Khan", email: "aisha.khan@vertexlog.com", company: "Vertex Logistics", title: "Product Lead" },
  { id: "c-6", name: "Daniel Osei", email: "daniel@coastlinefoods.com", company: "Coastline Foods", title: "CEO" },
  { id: "c-7", name: "Sofia Russo", email: "sofia.russo@heliosretail.com", company: "Helios Retail", title: "E-commerce Manager" },
  { id: "c-8", name: "Henrik Solberg", email: "henrik@northwindlabs.com", company: "Northwind Labs", title: "Procurement" },
  { id: "c-9", name: "Mei Tanaka", email: "mei.tanaka@acmedigital.com", company: "Acme Digital", title: "Design Lead" },
  { id: "c-10", name: "Owen Fletcher", email: "owen@brightwave.io", company: "Brightwave Media", title: "Growth Manager" },
  { id: "c-11", name: "Rosa Delgado", email: "rosa.delgado@vertexlog.com", company: "Vertex Logistics", title: "Operations Director" },
  { id: "c-12", name: "Jamal Ahmed", email: "jamal@coastlinefoods.com", company: "Coastline Foods", title: "Head of Marketing" },
];

const companies: Company[] = [
  { id: "co-1", name: "Northwind Labs", industry: "Software", deals: 2 },
  { id: "co-2", name: "Helios Retail", industry: "Retail", deals: 2 },
  { id: "co-3", name: "Brightwave Media", industry: "Media & Advertising", deals: 2 },
  { id: "co-4", name: "Acme Digital", industry: "Agency", deals: 2 },
  { id: "co-5", name: "Vertex Logistics", industry: "Logistics", deals: 2 },
  { id: "co-6", name: "Coastline Foods", industry: "Food & Beverage", deals: 2 },
];

const activities: Activity[] = [
  { id: "a-1", type: "call", subject: "Discovery call with Marcus Hale (Helios Retail)", when: "2026-06-15T14:30:00Z" },
  { id: "a-2", type: "email", subject: "Sent proposal — Design system (Northwind Labs)", when: "2026-06-15T11:05:00Z" },
  { id: "a-3", type: "task", subject: "Prepare SOW for E-commerce replatform", when: "2026-06-14T16:20:00Z" },
  { id: "a-4", type: "email", subject: "Follow-up on SEO retainer (Brightwave Media)", when: "2026-06-14T09:40:00Z" },
  { id: "a-5", type: "call", subject: "Kickoff with Tomás Rivera (Acme Digital)", when: "2026-06-13T13:00:00Z" },
  { id: "a-6", type: "task", subject: "Review analytics dashboard requirements", when: "2026-06-12T15:15:00Z" },
  { id: "a-7", type: "email", subject: "Contract signed — Annual support plan (Vertex)", when: "2026-06-11T10:30:00Z" },
  { id: "a-8", type: "call", subject: "Negotiation — Brand refresh (Coastline Foods)", when: "2026-06-10T17:00:00Z" },
  { id: "a-9", type: "task", subject: "Schedule demo for Mobile app build", when: "2026-06-09T12:10:00Z" },
  { id: "a-10", type: "email", subject: "Intro to Aisha Khan (Vertex Logistics)", when: "2026-06-08T08:50:00Z" },
];

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
}

export const crmRepository = new CrmRepository();
