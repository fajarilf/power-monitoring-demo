import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  digits?: number;
  accent: string;
  children: ReactNode;
}

export function StatCard({ label, value, unit, digits = 2, accent, children }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface p-4.5">
      <div className="absolute top-0 right-0 left-0 h-0.5" style={{ background: accent }} />
      <p className="mb-2.5 text-[11.5px] tracking-wide text-text-secondary uppercase">{label}</p>
      <p className="flex items-baseline gap-2">
        <span className="font-mono text-[26px] font-semibold tracking-tight">{value.toFixed(digits)}</span>
        {unit && <span className="text-xs text-text-dim">{unit}</span>}
      </p>
      <p className="mt-2 flex items-center gap-1 text-[11.5px]">{children}</p>
    </div>
  );
}
