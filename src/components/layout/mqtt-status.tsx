"use client";

import { useLiveReading, type LiveStatus } from "@/features/measurements";

const DOT: Record<LiveStatus, string> = {
  connecting: "var(--text-dim)",
  live: "var(--good)",
  offline: "var(--alert)",
};

const LABEL: Record<LiveStatus, string> = {
  connecting: "Meter…",
  live: "Meter live",
  offline: "Meter off",
};

export function MqttStatus() {
  const { status } = useLiveReading();

  return (
    <span className="flex items-center gap-1.5 text-xs text-text-secondary">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: DOT[status] }} aria-hidden="true" />
      {LABEL[status]}
    </span>
  );
}
