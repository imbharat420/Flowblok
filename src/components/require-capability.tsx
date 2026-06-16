"use client";

import { useAuth } from "@/lib/auth-context";
import type { Capability } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { Topbar } from "@/components/app-shell/topbar";
import { ShieldAlert } from "lucide-react";

// Page-level RBAC guard (layer 1). Renders an access-denied state if the current
// role lacks the capability — covers direct-URL access the sidebar can't hide.
export function RequireCapability({
  capability,
  title,
  children,
}: {
  capability: Capability;
  title: string;
  children: React.ReactNode;
}) {
  const { can } = useAuth();
  if (can(capability)) return <>{children}</>;
  return (
    <>
      <Topbar title={title} breadcrumb={["Acme Digital"]} />
      <main className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        <EmptyState
          icon={ShieldAlert}
          title="You don't have access to this module"
          description={`Your current role can't "${capability.replace(/_/g, " ")}". Switch to an Owner/Admin role from the top-right menu, or ask an admin for access.`}
        />
      </main>
    </>
  );
}
