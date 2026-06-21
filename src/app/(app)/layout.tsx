import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app-shell/sidebar";
import { AuthProvider } from "@/lib/auth-context";
import { SpaceProvider } from "@/lib/space-context";
import { getSession } from "@/server/auth/session";
import type { Role } from "@/lib/types";

// The inverted-L chrome: fixed sidebar + scrollable main column.
// Access is gated by a real DB-backed session — unauthenticated visitors are
// redirected to sign in. AuthProvider seeds the current user from that session;
// SpaceProvider provides the active space + switcher.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const u = session.user;
  const initialUser = {
    name: u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
    email: u.email,
    role: (u.role as Role) ?? "owner",
  };

  return (
    <AuthProvider initialUser={initialUser}>
      <SpaceProvider>
        <div className="flex h-screen overflow-hidden bg-bg">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </SpaceProvider>
    </AuthProvider>
  );
}
