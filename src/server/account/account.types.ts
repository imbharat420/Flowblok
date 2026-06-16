// Account (the signed-in user's own profile & preferences) — module-local types.

export type AccountRole = "developer" | "content_creator";
export type ThemeMode = "single" | "sync";
export type ThemeChoice = "default" | "dark" | "light_hc" | "dark_hc";
export type TokenPermission = "User Permission" | "Admin Permission";

export interface AccountProfile {
  email: string;
  username: string;
  showUsernameAsCollaborator: boolean;
  firstName: string;
  lastName: string;
  role: AccountRole;
  avatarColor: string;
  githubConnected: boolean;
  githubEmail: string | null;
}

export interface AppearanceSettings {
  mode: ThemeMode;
  theme: ThemeChoice;
}

export interface SecuritySettings {
  twoFactor: boolean;
}

export interface PrivacySettings {
  telemetry: boolean;
}

export interface PersonalAccessToken {
  id: string;
  name: string;
  maskedValue: string;
  plainValue?: string; // returned only once, at creation time
  expiresAt: string; // ISO
  permission: TokenPermission;
  deprecated: boolean;
}

export interface AccountSnapshot {
  profile: AccountProfile;
  appearance: AppearanceSettings;
  security: SecuritySettings;
  privacy: PrivacySettings;
  tokens: PersonalAccessToken[];
}
