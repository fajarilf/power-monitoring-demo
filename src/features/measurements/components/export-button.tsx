"use client";

import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { useMeasurements, useMeasurementsSummary } from "../api/measurements.queries";
import { COLUMNS } from "../utils/columns";
import type { Reading, Stats } from "../api/measurements.types";

const HEADER = ["Date", "Time", ...COLUMNS.map((c) => c.label)];

function statRow(label: string, s: Stats) {
  return [label, "", ...COLUMNS.map((c) => s[c.key].toFixed(c.digits))];
}

function dataRow(r: Reading) {
  return [
    r.ts.toLocaleDateString(),
    r.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    ...COLUMNS.map((c) => r[c.key].toFixed(c.digits)),
  ];
}

export interface ExportButtonProps {
  from: string;
  to: string;
}

export function ExportButton({ from, to }: ExportButtonProps) {
  // Same hooks (same query keys) as LogTableContainer — TanStack serves this
  // from cache, so export never costs an extra request and can't disagree
  // with what's on screen.
  const rowsQuery = useMeasurements({ from, to });
  const statsQuery = useMeasurementsSummary({ from, to });

  const disabled = rowsQuery.isPending || statsQuery.isPending || !!rowsQuery.error || !!statsQuery.error;

  function handleExport() {
    if (!rowsQuery.data || !statsQuery.data) return;
    const aoa = [
      HEADER,
      statRow("Average", statsQuery.data.avg),
      statRow("Maximum", statsQuery.data.max),
      statRow("Minimum", statsQuery.data.min),
      ...rowsQuery.data.map(dataRow),
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // merge the Date+Time columns for the three summary label rows (rows 1-3, 0-indexed)
    ws["!merges"] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Log History");
    XLSX.writeFile(wb, `power-log_${from}_${to}.xlsx`);
  }

  return (
    <Button type="button" variant="secondary" onClick={handleExport} disabled={disabled}>
      Export to Excel
    </Button>
  );
}
