"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "connected" | "mock" | "disconnected";

const DOT: Record<Status, string> = {
  checking: "var(--text-dim)",
  connected: "var(--good)",
  mock: "var(--warning)",
  disconnected: "var(--alert)",
};

const LABEL: Record<Status, string> = {
  checking: "Checking…",
  connected: "Connected",
  mock: "Mock data",
  disconnected: "Disconnected",
};

const POLL_MS = 15000;

export default function ConnectionStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { ok: boolean; source: string };
        if (!cancelled) setStatus(data.source === "mock" ? "mock" : "connected");
      } catch {
        if (!cancelled) setStatus("disconnected");
      }
    }

    check();
    const id = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <span className="flex items-center gap-1.5 text-xs text-text-secondary">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: DOT[status] }}
        aria-hidden="true"
      />
      {LABEL[status]}
    </span>
  );
}
