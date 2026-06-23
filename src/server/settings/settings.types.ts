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
  /** How long archived items stay in the bin before permanent deletion. 0 = lifetime. */
  archiveRetentionDays: number;
}

// Retention choices for the archive/bin. `0` means "Lifetime" (never auto-delete).
export const RETENTION_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 1, label: "1 day" },
  { value: 2, label: "2 days" },
  { value: 7, label: "1 week" },
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
  { value: 0, label: "Lifetime" },
];

export const REGIONS: Array<{ value: string; label: string }> = [
  { value: "eu-west-1", label: "European Union (Frankfurt)" },
  { value: "us-east-1", label: "United States (Virginia)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ca-central-1", label: "Canada (Montréal)" },
  { value: "au-southeast-2", label: "Australia (Sydney)" },
];
