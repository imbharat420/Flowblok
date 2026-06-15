// Module-local types for the Settings module. Kept here (not in the shared
// src/lib/types.ts) to respect module boundaries.

export interface SpaceGeneral {
  name: string;
  region: string;
  environment: "production" | "staging" | "development";
  spaceId: string;
}

export interface PlanCard {
  id: string;
  name: string;
  price: string; // formatted, e.g. "$99" or "Custom"
  cadence?: string; // e.g. "/mo"
  tagline: string;
  features: string[];
  current?: boolean;
  cta: string; // button label for non-current plans
  ctaVariant: "primary" | "secondary";
}

export interface DomainEntry {
  id: string;
  host: string;
  primary: boolean;
  status: "verified" | "pending";
  addedAt: string; // ISO
}

export interface DeveloperToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface SettingsSnapshot {
  general: SpaceGeneral;
  plans: PlanCard[];
  domains: DomainEntry[];
  toggles: DeveloperToggle[];
}

export const REGIONS: Array<{ value: string; label: string }> = [
  { value: "eu-west-1", label: "European Union (Frankfurt)" },
  { value: "us-east-1", label: "United States (Virginia)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ca-central-1", label: "Canada (Montréal)" },
  { value: "au-southeast-2", label: "Australia (Sydney)" },
];
