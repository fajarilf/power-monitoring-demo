import assert from "node:assert/strict";
import test from "node:test";
import { getReadings, summarize, consumption, previousRange, peakDemand, peakDemandAt } from "./data.ts";

test("previousRange returns an equal-length window ending the day before from", () => {
  const { from, to } = previousRange("2026-08-15", "2026-08-21"); // 7 days
  assert.equal(to, "2026-08-14");
  assert.equal(from, "2026-08-08"); // also 7 days
});

test("summarize: min <= avg <= max for every numeric key", () => {
  const rows = getReadings("2026-08-15", "2026-08-21");
  const { avg, max, min } = summarize(rows);
  for (const key of Object.keys(avg) as (keyof typeof avg)[]) {
    assert.ok(min[key] <= avg[key] + 1e-9, `${key}: min <= avg`);
    assert.ok(avg[key] <= max[key] + 1e-9, `${key}: avg <= max`);
  }
});

test("consumption is 0 for a single-row range", () => {
  const rows = getReadings("2026-08-15", "2026-08-15").slice(0, 1);
  assert.equal(consumption(rows), 0);
});

test("peakDemandAt returns the timestamp of the peakDemand row", () => {
  const rows = getReadings("2026-08-15", "2026-08-21");
  const at = peakDemandAt(rows);
  const peak = peakDemand(rows);
  assert.ok(at !== null);
  const match = rows.find((r) => r.ts.getTime() === at!.getTime());
  assert.equal(match?.p, peak);
});
