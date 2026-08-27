import { StatCard } from "./stat-card";
import { TrendCard } from "./trend-card";
import { PHASE_COLOR } from "../utils/columns";
import { PF_THRESHOLD } from "../utils/constants";
import { consumption, avgPerDay, peakDemand, peakDemandAt, averagePf } from "../utils/aggregate";
import type { DateRange, Reading } from "../api/measurements.types";

export interface KpiGridProps {
  range: DateRange;
  rows: Reading[];
  prevRange: DateRange;
  prevRows: Reading[];
}

export function KpiGrid({ range, rows, prevRange, prevRows }: KpiGridProps) {
  const kwh = consumption(rows);
  const perDay = avgPerDay(rows, range.from, range.to);
  const peak = peakDemand(rows);
  const peakAt = peakDemandAt(rows);
  const pf = averagePf(rows);

  const prevKwh = consumption(prevRows);
  const prevPerDay = avgPerDay(prevRows, prevRange.from, prevRange.to);

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <TrendCard label="Power Consumption" value={kwh} unit="kWh" accent={PHASE_COLOR.t} previous={prevKwh} />
      <TrendCard label="Average / day" value={perDay} unit="kWh/day" accent={PHASE_COLOR.t} previous={prevPerDay} />
      <StatCard label="Peak Demand" value={peak} unit="kW" accent="var(--warning)">
        <span className="text-text-dim">
          {peakAt
            ? `${peakAt.getMonth() + 1}/${peakAt.getDate()} · ${peakAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "—"}
        </span>
      </StatCard>
      <StatCard label="Avg Power Factor" value={pf} unit="" digits={3} accent="var(--good)">
        <span style={{ color: pf >= PF_THRESHOLD ? "var(--good)" : "var(--warning)" }}>
          ● {pf >= PF_THRESHOLD ? "within target" : "below target"}
        </span>
      </StatCard>
    </div>
  );
}
