// Module-local types for CRM Lite. Kept here (not in the shared src/lib/types.ts)
// per the module boundary rules.

export type DealStage = "New Lead" | "Qualified" | "Meeting" | "Proposal" | "Won";

export const DEAL_STAGES: DealStage[] = [
  "New Lead",
  "Qualified",
  "Meeting",
  "Proposal",
  "Won",
];

export interface Deal {
  id: string;
  name: string;
  value: number;
  company: string;
  stage: DealStage;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  deals: number;
}

export type ActivityType = "call" | "email" | "task";

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  when: string; // ISO timestamp
}

/** A single pipeline column: one stage with its deals and roll-up figures. */
export interface PipelineColumn {
  stage: DealStage;
  count: number;
  value: number;
  deals: Deal[];
}
