"use client";

import { useEffect, useState } from "react";

export interface ProgressTrackerProps {
  storageKey?: string;
}

export function ProgressTracker({
  storageKey = "chess-roadmap-progress",
}: ProgressTrackerProps) {
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch (error) {
        console.warn("Failed to parse stored progress", error);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, storageKey]);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
      <h2 className="text-base font-semibold text-foreground">
        Local progress tracker
      </h2>
      <p>
        Progress persistence will arrive in a future iteration. For now this
        component ensures the data contract for localStorage syncing is wired
        and ready.
      </p>
      <p className="text-xs">
        Current entries stored: <strong>{Object.keys(progress).length}</strong>
      </p>
    </div>
  );
}
