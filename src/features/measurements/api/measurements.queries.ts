import { useQuery } from "@tanstack/react-query";
import { getMeasurements, getMeasurementsSummary, DEVICE_ID } from "./measurements.service";
import type { GetMeasurementsParams } from "./measurements.types";

export const measurementKeys = {
  all: ["measurements"] as const,
  lists: () => [...measurementKeys.all, "list"] as const,
  list: (params: GetMeasurementsParams) => [...measurementKeys.lists(), DEVICE_ID, params] as const,
  summaries: () => [...measurementKeys.all, "summary"] as const,
  summary: (params: GetMeasurementsParams) => [...measurementKeys.summaries(), DEVICE_ID, params] as const,
};

export function useMeasurements(params: GetMeasurementsParams) {
  return useQuery({ queryKey: measurementKeys.list(params), queryFn: () => getMeasurements(params) });
}

export function useMeasurementsSummary(params: GetMeasurementsParams) {
  return useQuery({ queryKey: measurementKeys.summary(params), queryFn: () => getMeasurementsSummary(params) });
}
