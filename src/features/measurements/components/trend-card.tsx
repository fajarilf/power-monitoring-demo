import { StatCard } from "./stat-card";

export interface TrendCardProps {
  label: string;
  value: number;
  unit: string;
  accent: string;
  previous: number;
}

export function TrendCard({ label, value, unit, accent, previous }: TrendCardProps) {
  const delta = previous === 0 ? null : ((value - previous) / previous) * 100;
  // rising consumption is the bad direction, so this is intentionally
  // inverted from a typical "up is good" trend indicator
  const up = delta !== null && delta >= 0;
  return (
    <StatCard label={label} value={value} unit={unit} accent={accent}>
      {delta === null ? (
        <span className="text-text-dim">—</span>
      ) : (
        <span style={{ color: up ? "var(--alert)" : "var(--good)" }}>
          {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs prior period
        </span>
      )}
    </StatCard>
  );
}
