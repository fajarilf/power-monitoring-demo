import Chart from "@/components/Chart";
import DateRangeForm from "@/components/DateRangeForm";
import LogTable from "@/components/LogTable";
import { PHASE_BG, PHASE_COLOR } from "@/lib/columns";
import {
  avgPerDay,
  averagePf,
  consumption,
  getReadings,
  parseRange,
  peakDemand,
  peakDemandAt,
  previousRange,
  summarize,
  PF_THRESHOLD,
} from "@/lib/data";

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { from, to } = parseRange(await searchParams);
  const rows = getReadings(from, to);
  const stats = summarize(rows);

  const prev = previousRange(from, to);
  const prevRows = getReadings(prev.from, prev.to);

  const kwh = consumption(rows);
  const perDay = avgPerDay(rows, from, to);
  const peak = peakDemand(rows);
  const peakAt = peakDemandAt(rows);
  const pf = averagePf(rows);

  const prevKwh = consumption(prevRows);
  const prevPerDay = avgPerDay(prevRows, prev.from, prev.to);

  const chartLabels = rows.map((r) =>
    r.ts.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit" }),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="mb-1 flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-[12.5px] text-text-dim">Stanley · ECOMO Power Monitoring</p>
        </div>
        <span className="text-[12.5px] text-text-dim tracking-wide">
          Period: {from} to {to}
        </span>
      </div>

      <DateRangeForm from={from} to={to} rows={rows} stats={stats} />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <TrendCard
          label="Power Consumption"
          value={kwh}
          unit="kWh"
          accent={PHASE_COLOR.t}
          previous={prevKwh}
        />
        <TrendCard
          label="Average / day"
          value={perDay}
          unit="kWh/day"
          accent={PHASE_COLOR.t}
          previous={prevPerDay}
        />
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

      {/* <Chart
        panels={[
          {
            label: "kW",
            height: 160,
            series: [
              { label: "Total P (kW)", values: rows.map((r) => r.p), color: PHASE_COLOR.t, areaFill: PHASE_BG.t },
            ],
          },
          {
            label: "PF",
            height: 56,
            yDomain: [0.85, 1.0],
            hairline: PF_THRESHOLD,
            series: [{ label: "Power Factor", values: rows.map((r) => r.pf), color: "var(--text-dim)", dash: "3 3" }],
          },
        ]}
        labels={chartLabels}
      /> */}

      <div className="rounded-lg border border-border bg-surface">
        {/* <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-display text-[14.5px] font-semibold">Log History</h2>
          <span className="text-[11.5px] text-text-dim">
            Period: {from} to {to}
          </span>
        </div> */}
        <LogTable rows={rows} stats={stats} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  digits = 2,
  accent,
  children,
}: {
  label: string;
  value: number;
  unit: string;
  digits?: number;
  accent: string;
  children: React.ReactNode;
}) {
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

function TrendCard({
  label,
  value,
  unit,
  accent,
  previous,
}: {
  label: string;
  value: number;
  unit: string;
  accent: string;
  previous: number;
}) {
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
