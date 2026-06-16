"use client";

import { useEffect, useState } from "react";
import type { Story, StoryVersion } from "@/lib/types";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, Check } from "lucide-react";

export function HistoryDrawer({
  open,
  storyId,
  onClose,
  onRestored,
}: {
  open: boolean;
  storyId: string;
  onClose: () => void;
  onRestored: (story: Story) => void;
}) {
  const [versions, setVersions] = useState<StoryVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/content/${storyId}/versions`)
      .then((r) => r.json())
      .then((d) => setVersions(d.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open) {
      setError(null);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, storyId]);

  const restore = async (versionId: string) => {
    setBusy(versionId);
    setError(null);
    try {
      const res = await fetch(`/api/content/${storyId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      if (res.status === 403) {
        setError("You don't have permission to restore versions.");
        return;
      }
      if (!res.ok) throw new Error(`Restore failed (${res.status})`);
      const story = (await res.json()) as Story;
      onRestored(story);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Version history">
      {error && (
        <div className="mb-3 rounded-md border border-err/40 bg-err/10 px-3 py-2 text-[12px] text-err">{error}</div>
      )}
      {loading && <p className="text-[13px] text-fg-muted">Loading history…</p>}
      {!loading && versions.length === 0 && (
        <p className="text-[13px] text-fg-muted">No versions yet — save to create one.</p>
      )}
      <ol className="relative space-y-1">
        {versions.map((v, i) => (
          <li key={v.id} className="flex items-start gap-3 rounded-md px-2 py-2.5 hover:bg-surface-2">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted">
              {i === 0 ? <Check className="h-3.5 w-3.5 text-ok" /> : <History className="h-3.5 w-3.5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-fg">
                {v.label} {i === 0 && <span className="ml-1 text-[11px] font-normal text-ok">· current</span>}
              </p>
              <p className="text-[11px] text-fg-subtle">
                {new Date(v.at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · {v.author}
              </p>
            </div>
            {i !== 0 && (
              <Button size="sm" variant="secondary" disabled={busy === v.id} onClick={() => restore(v.id)}>
                <RotateCcw className="h-3 w-3" /> {busy === v.id ? "Restoring…" : "Restore"}
              </Button>
            )}
          </li>
        ))}
      </ol>
    </Drawer>
  );
}
