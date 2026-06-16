import { AuthProvider } from "@/lib/auth-context";

// Account settings owns its own full-page chrome (outside the app shell),
// like Storyblok's account area.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-bg">{children}</div>
    </AuthProvider>
  );
}
