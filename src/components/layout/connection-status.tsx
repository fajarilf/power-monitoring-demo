"use client";

import { useDevices } from "@/features/devices";

type Status = "checking" | "connected" | "disconnected";

const DOT: Record<Status, string> = {
  checking: "var(--text-dim)",
  connected: "var(--good)",
  disconnected: "var(--alert)",
};

const LABEL: Record<Status, string> = {
  checking: "Checking…",
  connected: "Connected",
  disconnected: "Disconnected",
};

export function ConnectionStatus() {
  const { isPending, isError } = useDevices();
  const status: Status = isPending ? "checking" : isError ? "disconnected" : "connected";

  return (
    <span className="flex items-center gap-1.5 text-xs text-text-secondary">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: DOT[status] }} aria-hidden="true" />
      {LABEL[status]}
    </span>
  );
}
