// Repository layer — the ONLY layer that talks to the data source.
// Holds its own in-memory seed for the Settings module. Swap for a real DB
// without touching the service or controller.

import type {
  DeveloperToggle,
  DomainEntry,
  PlanCard,
  SpaceGeneral,
} from "./settings.types";

const general: SpaceGeneral = {
  name: "Acme Digital",
  region: "eu-west-1",
  environment: "production",
  spaceId: "spc_8421f0a9c3",
};

const plans: PlanCard[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    cadence: "/mo",
    tagline: "For side projects and small sites.",
    features: ["1 space", "2 seats", "10k API calls / mo", "Community support"],
    cta: "Downgrade",
    ctaVariant: "secondary",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$99",
    cadence: "/mo",
    tagline: "For growing teams shipping in production.",
    features: ["5 spaces", "10 seats", "1M API calls / mo", "Workflows + webhooks", "Email support"],
    current: true,
    cta: "Current plan",
    ctaVariant: "secondary",
  },
  {
    id: "business",
    name: "Business",
    price: "$299",
    cadence: "/mo",
    tagline: "Scale, roles and audit-grade controls.",
    features: ["Unlimited spaces", "25 seats", "10M API calls / mo", "RBAC + audit log", "Priority support"],
    cta: "Upgrade",
    ctaVariant: "primary",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    tagline: "SSO, SLAs and dedicated infrastructure.",
    features: ["Custom limits", "Unlimited seats", "SAML / SCIM SSO", "99.99% SLA", "Dedicated CSM"],
    cta: "Contact sales",
    ctaVariant: "secondary",
  },
];

const domains: DomainEntry[] = [
  {
    id: "dom_1",
    host: "www.acmedigital.com",
    primary: true,
    status: "verified",
    addedAt: "2025-11-02T09:15:00.000Z",
  },
  {
    id: "dom_2",
    host: "preview.acmedigital.com",
    primary: false,
    status: "verified",
    addedAt: "2026-01-18T14:42:00.000Z",
  },
  {
    id: "dom_3",
    host: "campaign.acme.io",
    primary: false,
    status: "pending",
    addedAt: "2026-06-10T11:03:00.000Z",
  },
];

const toggles: DeveloperToggle[] = [
  {
    id: "developer_mode",
    label: "Developer Mode (Visual ↔ Code)",
    description: "Switch any block between the visual editor and its underlying JSON / code view.",
    enabled: true,
  },
  {
    id: "api_access",
    label: "API access",
    description: "Allow the Management & Content Delivery APIs to read and write this space.",
    enabled: true,
  },
  {
    id: "webhooks",
    label: "Webhooks",
    description: "Emit publish, change and workflow events to your registered endpoints.",
    enabled: false,
  },
];

export class SettingsRepository {
  getGeneral(): SpaceGeneral {
    return general;
  }

  updateGeneral(patch: Partial<SpaceGeneral>): SpaceGeneral {
    if (typeof patch.name === "string") general.name = patch.name;
    if (typeof patch.region === "string") general.region = patch.region;
    return general;
  }

  listPlans(): PlanCard[] {
    return plans;
  }

  listDomains(): DomainEntry[] {
    return domains;
  }

  addDomain(host: string): DomainEntry {
    const entry: DomainEntry = {
      id: `dom_${Math.random().toString(36).slice(2, 8)}`,
      host,
      primary: false,
      status: "pending",
      addedAt: new Date().toISOString(),
    };
    domains.push(entry);
    return entry;
  }

  listToggles(): DeveloperToggle[] {
    return toggles;
  }

  setToggle(id: string, enabled: boolean): DeveloperToggle | undefined {
    const t = toggles.find((x) => x.id === id);
    if (!t) return undefined;
    t.enabled = enabled;
    return t;
  }
}

export const settingsRepository = new SettingsRepository();
