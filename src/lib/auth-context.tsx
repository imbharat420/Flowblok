"use client";

import { createContext, useContext, useState } from "react";
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
