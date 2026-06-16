"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Capability, Role } from "@/lib/types";
import { can as rbacCan } from "@/lib/rbac";

interface CurrentUser {
  name: string;
  email: string;
  role: Role;
}

interface AuthValue {
  user: CurrentUser;
  setRole: (role: Role) => void;
  can: (cap: Capability) => boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

// Mock session for the visualization — you start as Owner (super admin).
// The role switcher in the top bar lets you preview the app as any role.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("owner");
  const user: CurrentUser = { name: "Dharamraj N.", email: "dharamraj.nagar@dotsquares.com", role };

  // Mirror the active role into a cookie so server route handlers can enforce
  // capabilities (the 3-layer RBAC enforcement from 03-SECURITY-AND-ACCESS.md).
  useEffect(() => {
    document.cookie = `fb_role=${role}; path=/; samesite=lax; max-age=86400`;
  }, [role]);

  return (
    <AuthContext.Provider value={{ user, setRole, can: (cap) => rbacCan(role, cap) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
