import { AuthProvider } from "@/lib/auth-context";

// Full-page editor shell — deliberately OUTSIDE the (app) group so the main
// sidebar is hidden and the editor owns the whole viewport (Storyblok-style).
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-bg">{children}</div>
    </AuthProvider>
  );
}
