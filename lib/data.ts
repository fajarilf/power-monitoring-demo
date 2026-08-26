// Mock power-meter data. Swap the body of getReadings() for a real fetch
// later — every caller only depends on the Reading shape below.

export type Reading = {
  ts: Date;
  u1: number; // U1-R (V)
  u2: number; // U2-S (V)
  u3: number; // U3-T (V)
  i1: number; // I1-R (A)
  i2: number; // I2-S (A)
  i3: number; // I3-T (A)
  s: number; // S (kVA)
  p: number; // P (kW)
  q: number; // Q (kvar)
  pf: number; // PF
  wp: number; // WP+ (kWh), cumulative register
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parse ?from=&to= from the URL, defaulting to the last 7 days and
 * correcting bad input instead of producing an empty range. */
export function parseRange(searchParams: {
  from?: string;
  to?: string;
}): { from: string; to: string } {
  const today = new Date();
  const defaultTo = fmt(today);
  const defaultFrom = fmt(new Date(today.getTime() - 6 * DAY_MS));

  let from = searchParams.from && DATE_RE.test(searchParams.from) ? searchParams.from : defaultFrom;
  let to = searchParams.to && DATE_RE.test(searchParams.to) ? searchParams.to : defaultTo;

  if (from > to) [from, to] = [to, from];
  return { from, to };
}

// ponytail: seeded LCG instead of Math.random() so a re-render / re-navigation
// doesn't reshuffle the mock series. Swap this whole function for a real
// fetch() to the meter API when it exists.
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getReadings(from: string, to: string): Reading[] {
  const start = new Date(from + "T00:00:00");
  const end = new Date(to + "T23:00:00");
  const rand = seededRandom(start.getTime() / DAY_MS);

  const rows: Reading[] = [];
  let wp = 10000; // starting cumulative register
  for (let t = start.getTime(); t <= end.getTime(); t += 60 * 60 * 1000) {
    const ts = new Date(t);
    const hour = ts.getHours();
    // rough daytime load curve so numbers look plausible
    const loadFactor = 0.4 + 0.6 * Math.sin((Math.max(hour - 6, 0) / 18) * Math.PI);
    const p = Math.max(5, 40 * loadFactor + (rand() - 0.5) * 4); // kW
    const pf = 0.9 + rand() * 0.08;
    const s = p / pf; // kVA
    const q = Math.sqrt(Math.max(s * s - p * p, 0)); // kvar
    const u1 = 218 + (rand() - 0.5) * 6;
    const u2 = 219 + (rand() - 0.5) * 6;
    const u3 = 220 + (rand() - 0.5) * 6;
    const i1 = (p * 1000) / 3 / u1;
    const i2 = (p * 1000) / 3 / u2;
    const i3 = (p * 1000) / 3 / u3;

    wp += p; // 1-hour interval, so kW == kWh added this step

    rows.push({ ts, u1, u2, u3, i1, i2, i3, s, p, q, pf, wp });
  }
  return rows;
}

type Stats = Omit<Reading, "ts">;
const NUMERIC_KEYS = ["u1", "u2", "u3", "i1", "i2", "i3", "s", "p", "q", "pf", "wp"] as const;

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
  const days = Math.max(
    1,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS) + 1,
  );
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

export const PF_THRESHOLD = 0.93;
