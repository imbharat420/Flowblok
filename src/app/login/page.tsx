"use client";

import { useRouter } from "next/navigation";
import { Boxes, ArrowRight } from "lucide-react";

// Lightweight sign-in screen. Auth is mocked for this build (see auth-context),
// so "Log out" clears the role cookie and lands here; signing back in re-enters
// the app as the default owner session.
export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6">
      <div className="w-full max-w-[360px] rounded-xl border border-border bg-surface p-7 shadow-2xl">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-accent-fg">
            <Boxes className="h-5 w-5" />
          </span>
          <span className="text-[15px] font-semibold text-fg">Flowblok</span>
        </div>

        <h1 className="text-[18px] font-semibold text-fg">Sign in</h1>
        <p className="mt-1 text-[13px] text-fg-muted">
          Continue to your workspace. You&apos;ll re-enter as the demo owner session.
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-2.5 text-[13px] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          Continue to Flowblok <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </main>
  );
}
