import ExportButton from "@/components/ExportButton";
import { BUTTON_PRIMARY } from "@/lib/columns";
import type { Reading } from "@/lib/data";

type Stats = { avg: Omit<Reading, "ts">; max: Omit<Reading, "ts">; min: Omit<Reading, "ts"> };

export default function DateRangeForm({
  from,
  to,
  rows,
  stats,
}: {
  from: string;
  to: string;
  rows: Reading[];
  stats: Stats;
}) {
  return (
    <form className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-col">
        <label className="mb-1.5 text-[11.5px] tracking-wide text-text-secondary uppercase">Start date</label>
        <input
          type="date"
          name="from"
          defaultValue={from}
          max={to}
          className="rounded-md border border-border bg-surface-2 px-2.5 py-2 font-mono text-[13px] text-text-primary"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1.5 text-[11.5px] tracking-wide text-text-secondary uppercase">End date</label>
        <input
          type="date"
          name="to"
          defaultValue={to}
          min={from}
          className="rounded-md border border-border bg-surface-2 px-2.5 py-2 font-mono text-[13px] text-text-primary"
        />
      </div>
      <button type="submit" className={BUTTON_PRIMARY}>
        Apply
      </button>
      <div className="ml-auto">
        <ExportButton rows={rows} stats={stats} from={from} to={to} />
      </div>
    </form>
  );
}
