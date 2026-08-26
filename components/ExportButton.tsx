"use client";

import * as XLSX from "xlsx";
import type { Reading } from "@/lib/data";
import { COLUMNS, BUTTON_SECONDARY } from "@/lib/columns";

const HEADER = ["Date", "Time", ...COLUMNS.map((c) => c.label)];

type Stats = Omit<Reading, "ts">;

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

export default function ExportButton({
  rows,
  stats,
  from,
  to,
}: {
  rows: Reading[];
  stats: { avg: Stats; max: Stats; min: Stats };
  from: string;
  to: string;
}) {
  function handleExport() {
    const aoa = [
      HEADER,
      statRow("Average", stats.avg),
      statRow("Maximum", stats.max),
      statRow("Minimum", stats.min),
      ...rows.map(dataRow),
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
    <button type="button" onClick={handleExport} className={BUTTON_SECONDARY}>
      Export to Excel
    </button>
  );
}
