import { Sidebar } from "@/components/app-shell/sidebar";
import { AuthProvider } from "@/lib/auth-context";
import { SpaceProvider } from "@/lib/space-context";

// The inverted-L chrome: fixed sidebar + scrollable main column.
// AuthProvider = current user/role (rbac.can); SpaceProvider = active space + switcher.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SpaceProvider>
        <div className="flex h-screen overflow-hidden bg-bg">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </SpaceProvider>
    </AuthProvider>
  );
}
