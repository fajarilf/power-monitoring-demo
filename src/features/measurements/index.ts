// The feature's public surface — export only what app/ actually consumes.
// See AGENTS.md §9: barrel files that re-export everything can drag
// server-only modules or heavy dependencies into a client bundle.

export { parseRange } from "./utils/date-range";
export { getReadings } from "./utils/mock-readings";
export { previousRange } from "./utils/aggregate";
export { PF_THRESHOLD } from "./utils/constants";
export { PHASE_COLOR, PHASE_BG } from "./utils/columns";
export { DateRangeForm } from "./components/date-range-form";
export { KpiGrid } from "./components/kpi-grid";
export { LogTableContainer } from "./components/log-table-container";
export type { DateRange } from "./api/measurements.types";
