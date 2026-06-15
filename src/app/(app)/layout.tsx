import { Sidebar } from "@/components/app-shell/sidebar";
import { AuthProvider } from "@/lib/auth-context";

// The inverted-L chrome: fixed sidebar + scrollable main column.
// AuthProvider supplies the current user/role so the whole app can gate via rbac.can().
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-bg">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </AuthProvider>
  );
}
