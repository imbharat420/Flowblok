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

// The current user is seeded from the real session (passed by the app layout).
// The role switcher in the top bar still lets you preview the app as any role.
export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: { name: string; email: string; role: Role };
}) {
  const [role, setRole] = useState<Role>(initialUser?.role ?? "owner");
  const user: CurrentUser = {
    name: initialUser?.name ?? "Flowblok User",
    email: initialUser?.email ?? "user@flowblok.dev",
    role,
  };

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
