import {
  parseRange,
  getReadings,
  previousRange,
  DateRangeForm,
  KpiGrid,
  LogTableContainer,
} from "@/features/measurements";

interface DashboardPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { from, to } = parseRange(await searchParams);
  const rows = getReadings(from, to);
  const prevRange = previousRange(from, to);
  const prevRows = getReadings(prevRange.from, prevRange.to);

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

      <DateRangeForm from={from} to={to} />

      <KpiGrid range={{ from, to }} rows={rows} prevRange={prevRange} prevRows={prevRows} />

      <LogTableContainer range={{ from, to }} />
    </div>
  );
}
