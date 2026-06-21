// In-memory account store (the current user's own settings). Swap for the DB later.

import type {
  AccountProfile,
  AppearanceSettings,
  PersonalAccessToken,
  PrivacySettings,
  SecuritySettings,
  TokenPermission,
} from "./account.types";

// Cleared of demo identity. (The signed-in account lives in Postgres; this
// in-memory profile is a neutral placeholder for the account-settings screen.)
const profile: AccountProfile = {
  email: "",
  username: "",
  showUsernameAsCollaborator: true,
  firstName: "",
  lastName: "",
  role: "developer",
  avatarColor: "#2563eb",
  githubConnected: false,
  githubEmail: null,
};

const appearance: AppearanceSettings = { mode: "single", theme: "dark" };
const security: SecuritySettings = { twoFactor: false };
const privacy: PrivacySettings = { telemetry: true };

let tokenSeq = 0;
const tokens: PersonalAccessToken[] = [];

function rand(n: number): string {
  let s = "";
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

export class AccountRepository {
  profile() { return profile; }
  appearance() { return appearance; }
  security() { return security; }
  privacy() { return privacy; }
  tokens() { return tokens; }

  patchProfile(patch: Partial<AccountProfile>): AccountProfile {
    Object.assign(profile, patch);
    return profile;
  }
  patchAppearance(patch: Partial<AppearanceSettings>): AppearanceSettings {
    Object.assign(appearance, patch);
    return appearance;
  }
  patchSecurity(patch: Partial<SecuritySettings>): SecuritySettings {
    Object.assign(security, patch);
    return security;
  }
  patchPrivacy(patch: Partial<PrivacySettings>): PrivacySettings {
    Object.assign(privacy, patch);
    return privacy;
  }

  createToken(name: string, permission: TokenPermission): PersonalAccessToken {
    tokenSeq += 1;
    const plain = "sbpat_" + rand(28);
    const token: PersonalAccessToken = {
      id: "pat_" + tokenSeq + "_" + rand(4),
      name,
      maskedValue: "••••••••••" + plain.slice(-4),
      plainValue: plain,
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      permission,
      deprecated: false,
    };
    tokens.unshift(token);
    return token;
  }

  deleteToken(id: string): boolean {
    const i = tokens.findIndex((t) => t.id === id);
    if (i === -1) return false;
    tokens.splice(i, 1);
    return true;
  }
}

export const accountRepository = new AccountRepository();
