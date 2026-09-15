"use client";

import { useMeasurements } from "../api/measurements.queries";
import { MeasurementCharts } from "./measurement-charts";
import type { DateRange } from "../api/measurements.types";

export interface MeasurementChartsContainerProps {
  range: DateRange;
}

export function MeasurementChartsContainer({ range }: MeasurementChartsContainerProps) {
  // Same params as LogTableContainer's useMeasurements → shared React Query
  // cache key, so the two views share one request.
  const rowsQuery = useMeasurements(range);

  return (
    <MeasurementCharts
      rows={rowsQuery.data ?? []}
      loading={rowsQuery.isPending}
      error={rowsQuery.error}
      onRetry={() => rowsQuery.refetch()}
    />
  );
}
