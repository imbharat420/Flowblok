import { Sidebar } from "@/components/app-shell/sidebar";

// The inverted-L chrome: fixed sidebar + scrollable main column.
// Each page renders its own <Topbar> so the header reflects context.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
