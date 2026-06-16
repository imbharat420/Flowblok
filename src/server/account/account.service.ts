// Account service — orchestrates the repository; strips secrets from listed tokens.
import { AccountRepository, accountRepository } from "./account.repository";
import type {
  AccountProfile,
  AccountSnapshot,
  AppearanceSettings,
  PersonalAccessToken,
  PrivacySettings,
  SecuritySettings,
  TokenPermission,
} from "./account.types";

const stripPlain = (t: PersonalAccessToken): PersonalAccessToken => {
  const { plainValue: _omit, ...rest } = t;
  void _omit;
  return rest;
};

export class AccountService {
  constructor(private readonly repo: AccountRepository = accountRepository) {}

  snapshot(): AccountSnapshot {
    return {
      profile: this.repo.profile(),
      appearance: this.repo.appearance(),
      security: this.repo.security(),
      privacy: this.repo.privacy(),
      tokens: this.repo.tokens().map(stripPlain),
    };
  }

  updateProfile(patch: Partial<AccountProfile>) { return this.repo.patchProfile(patch); }
  updateAppearance(patch: Partial<AppearanceSettings>) { return this.repo.patchAppearance(patch); }
  updateSecurity(patch: Partial<SecuritySettings>) { return this.repo.patchSecurity(patch); }
  updatePrivacy(patch: Partial<PrivacySettings>) { return this.repo.patchPrivacy(patch); }

  /** Returns the token WITH its one-time plain value. */
  createToken(name: string, permission: TokenPermission): PersonalAccessToken {
    return this.repo.createToken(name, permission);
  }
  deleteToken(id: string): boolean { return this.repo.deleteToken(id); }
}

export const accountService = new AccountService();
