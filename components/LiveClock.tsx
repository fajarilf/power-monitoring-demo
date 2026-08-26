"use client";

import { useEffect, useState } from "react";

// ponytail: renders nothing until mounted — a clock is the textbook
// server/client hydration mismatch (server's `now` is always in the past by
// the time the client hydrates), so skip the first render entirely.
export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <span className="font-mono text-xs text-text-secondary" suppressHydrationWarning>
      {now.toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" })}{" "}
      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}
