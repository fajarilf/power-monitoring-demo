"use client";

import { useMeasurements, useMeasurementsSummary } from "../api/measurements.queries";
import { LogTable } from "./log-table";
import type { DateRange } from "../api/measurements.types";

export interface LogTableContainerProps {
  range: DateRange;
}

export function LogTableContainer({ range }: LogTableContainerProps) {
  const rowsQuery = useMeasurements(range);
  const statsQuery = useMeasurementsSummary(range);

  const loading = rowsQuery.isPending || statsQuery.isPending;
  // Narrowed to the rows query on purpose: a hiccup on the secondary summary
  // query shouldn't blank out a table whose rows loaded fine.
  const error = rowsQuery.error;

  return (
    <LogTable
      rows={rowsQuery.data ?? []}
      stats={statsQuery.data}
      loading={loading}
      error={error}
      onRetry={() => {
        rowsQuery.refetch();
        statsQuery.refetch();
      }}
    />
  );
}
