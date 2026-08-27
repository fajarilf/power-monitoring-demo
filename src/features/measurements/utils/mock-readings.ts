// Mock power-meter data. Swap the body of getReadings() for a real fetch
// later — every caller only depends on the Reading shape.

import type { Reading } from "../api/measurements.types";

const DAY_MS = 24 * 60 * 60 * 1000;

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
