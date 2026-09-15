"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PHASE_COLOR, PHASE_LABEL } from "../utils/columns";
import { PF_THRESHOLD } from "../utils/constants";
import type { Reading } from "../api/measurements.types";

type SeriesKey = keyof Omit<Reading, "ts">;

interface Series {
  key: SeriesKey;
  label: string;
  color: string;
}

interface ChartSpec {
  title: string;
  unit: string;
  digits: number;
  series: Series[];
  domain?: [number, number];
  threshold?: number;
}

const CHARTS: ChartSpec[] = [
  {
    title: "Three-phase voltage",
    unit: "V",
    digits: 1,
    series: [
      { key: "u1", label: PHASE_LABEL.r, color: PHASE_COLOR.r },
      { key: "u2", label: PHASE_LABEL.s, color: PHASE_COLOR.s },
      { key: "u3", label: PHASE_LABEL.t, color: PHASE_COLOR.t },
    ],
  },
  {
    title: "Three-phase current",
    unit: "A",
    digits: 2,
    series: [
      { key: "i1", label: PHASE_LABEL.r, color: PHASE_COLOR.r },
      { key: "i2", label: PHASE_LABEL.s, color: PHASE_COLOR.s },
      { key: "i3", label: PHASE_LABEL.t, color: PHASE_COLOR.t },
    ],
  },
  {
    title: "Active power",
    unit: "kW",
    digits: 2,
    series: [{ key: "p", label: "P", color: "var(--warning)" }],
  },
  {
    title: "Power factor",
    unit: "",
    digits: 3,
    domain: [0, 1],
    threshold: PF_THRESHOLD,
    series: [{ key: "pf", label: "PF", color: "var(--good)" }],
  },
];

type ChartRow = Reading & { t: number };

const fmtTime = (v: number) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDateTime = (v: unknown) => (typeof v === "number" ? new Date(v).toLocaleString() : String(v));

export interface MeasurementChartsProps {
  rows: Reading[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function MeasurementCharts({ rows, loading, error, onRetry }: MeasurementChartsProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center text-[12.5px]">
        <span style={{ color: "var(--alert)" }}>{error.message}</span>
        <button
          type="button"
          onClick={onRetry}
          className="ml-3 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium hover:bg-border-soft"
        >
          Retry
        </button>
      </div>
    );
  }

  // ponytail: plotting the raw history (limit 5000) directly — fine at that
  // cap. Downsample here only if a wide date range visibly lags.
  const data: ChartRow[] = loading ? [] : rows.map((r) => ({ ...r, t: r.ts.getTime() }));

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
      {CHARTS.map((spec) => (
        <div key={spec.title} className="rounded-lg border border-border bg-surface p-4.5">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[11.5px] tracking-wide text-text-secondary uppercase">{spec.title}</p>
            {spec.unit && <span className="text-xs text-text-dim">{spec.unit}</span>}
          </div>
          {loading ? (
            <div className="h-64 animate-pulse rounded bg-surface-2" />
          ) : data.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-[12.5px] text-text-dim">
              No readings in this period.
            </div>
          ) : (
            <TimeSeriesChart spec={spec} data={data} />
          )}
        </div>
      ))}
    </div>
  );
}

function TimeSeriesChart({ spec, data }: { spec: ChartSpec; data: ChartRow[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="var(--border-soft)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            minTickGap={40}
            tickFormatter={fmtTime}
            tick={{ fontSize: 11, fill: "var(--text-dim)" }}
            stroke="var(--border)"
          />
          <YAxis
            domain={spec.domain ?? ["auto", "auto"]}
            width={48}
            tick={{ fontSize: 11, fill: "var(--text-dim)" }}
            stroke="var(--border)"
            tickFormatter={(v: number) => v.toFixed(spec.digits >= 3 ? 2 : 0)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={fmtDateTime}
            formatter={(value) => (typeof value === "number" ? value.toFixed(spec.digits) : String(value))}
          />
          {spec.series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {spec.threshold !== undefined && (
            <ReferenceLine
              y={spec.threshold}
              stroke="var(--warning)"
              strokeDasharray="4 4"
              label={{
                value: `min ${spec.threshold}`,
                position: "insideBottomRight",
                fontSize: 10,
                fill: "var(--warning)",
              }}
            />
          )}
          {spec.series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
