import type { Reading, Stats } from "../api/measurements.types";

const DAY_MS = 24 * 60 * 60 * 1000;
const NUMERIC_KEYS = ["u1", "u2", "u3", "i1", "i2", "i3", "s", "p", "q", "pf", "wp"] as const;

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function summarize(rows: Reading[]): { avg: Stats; max: Stats; min: Stats } {
  const empty = Object.fromEntries(NUMERIC_KEYS.map((k) => [k, 0])) as Stats;
  if (rows.length === 0) return { avg: empty, max: empty, min: empty };

  const avg = { ...empty };
  const max = { ...empty };
  const min = { ...empty };
  for (const k of NUMERIC_KEYS) {
    const values = rows.map((r) => r[k]);
    avg[k] = values.reduce((a, b) => a + b, 0) / values.length;
    max[k] = Math.max(...values);
    min[k] = Math.min(...values);
  }
  return { avg, max, min };
}

/** Consumption over the period, from the cumulative WP+ register. */
export function consumption(rows: Reading[]): number {
  if (rows.length < 2) return 0;
  return rows[rows.length - 1].wp - rows[0].wp;
}

export function avgPerDay(rows: Reading[], from: string, to: string): number {
  const days = Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS) + 1);
  return consumption(rows) / days;
}

/** The equal-length window immediately preceding [from, to], for trend deltas. */
export function previousRange(from: string, to: string): { from: string; to: string } {
  const spanDays = Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS) + 1;
  const prevTo = fmt(new Date(new Date(from).getTime() - DAY_MS));
  const prevFrom = fmt(new Date(new Date(from).getTime() - spanDays * DAY_MS));
  return { from: prevFrom, to: prevTo };
}

export function peakDemand(rows: Reading[]): number {
  return rows.length === 0 ? 0 : Math.max(...rows.map((r) => r.p));
}

/** Timestamp of the peak-P row, for the Peak Demand card's sub-line. */
export function peakDemandAt(rows: Reading[]): Date | null {
  if (rows.length === 0) return null;
  return rows.reduce((best, r) => (r.p > best.p ? r : best), rows[0]).ts;
}

export function averagePf(rows: Reading[]): number {
  return rows.length === 0 ? 0 : rows.reduce((a, r) => a + r.pf, 0) / rows.length;
}
