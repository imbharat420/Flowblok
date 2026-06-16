// Account controller — HTTP mapping for the signed-in user's own settings.
import { AccountService, accountService } from "./account.service";
import type { ApiResult } from "@/server/content/content.controller";
import type { AccountRole, ThemeChoice, ThemeMode, TokenPermission } from "./account.types";

const ROLES: AccountRole[] = ["developer", "content_creator"];
const MODES: ThemeMode[] = ["single", "sync"];
const THEMES: ThemeChoice[] = ["default", "dark", "light_hc", "dark_hc"];
const PERMS: TokenPermission[] = ["User Permission", "Admin Permission"];

export class AccountController {
  constructor(private readonly service: AccountService = accountService) {}

  get(): ApiResult {
    return { status: 200, body: this.service.snapshot() };
  }

  updateProfile(body: unknown): ApiResult {
    const b = (body ?? {}) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    for (const k of ["email", "username", "firstName", "lastName"]) {
      if (typeof b[k] === "string") patch[k] = b[k];
    }
    if (typeof b.showUsernameAsCollaborator === "boolean") patch.showUsernameAsCollaborator = b.showUsernameAsCollaborator;
    if (typeof b.githubConnected === "boolean") patch.githubConnected = b.githubConnected;
    if (ROLES.includes(b.role as AccountRole)) patch.role = b.role;
    return { status: 200, body: this.service.updateProfile(patch) };
  }

  updateAppearance(body: unknown): ApiResult {
    const b = (body ?? {}) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (MODES.includes(b.mode as ThemeMode)) patch.mode = b.mode;
    if (THEMES.includes(b.theme as ThemeChoice)) patch.theme = b.theme;
    return { status: 200, body: this.service.updateAppearance(patch) };
  }

  updateSecurity(body: unknown): ApiResult {
    const b = (body ?? {}) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (typeof b.twoFactor === "boolean") patch.twoFactor = b.twoFactor;
    return { status: 200, body: this.service.updateSecurity(patch) };
  }

  updatePrivacy(body: unknown): ApiResult {
    const b = (body ?? {}) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (typeof b.telemetry === "boolean") patch.telemetry = b.telemetry;
    return { status: 200, body: this.service.updatePrivacy(patch) };
  }

  createToken(body: unknown): ApiResult {
    const b = (body ?? {}) as Record<string, unknown>;
    const name = typeof b.name === "string" ? b.name.trim() : "";
    if (!name) return { status: 400, body: { error: "Token name is required" } };
    const permission = PERMS.includes(b.permission as TokenPermission) ? (b.permission as TokenPermission) : "User Permission";
    return { status: 201, body: this.service.createToken(name, permission) };
  }

  deleteToken(id: string): ApiResult {
    return this.service.deleteToken(id)
      ? { status: 200, body: { ok: true, id } }
      : { status: 404, body: { error: "Token not found", id } };
  }
}

export const accountController = new AccountController();
