import { useQuery } from "@tanstack/react-query";
import { getDevices } from "./devices.service";

// The header's connection dot polls this — same interval the old mock
// /api/health check used.
const POLL_MS = 15_000;

export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
};

export function useDevices() {
  return useQuery({
    queryKey: deviceKeys.lists(),
    queryFn: getDevices,
    refetchInterval: POLL_MS,
    retry: false, // a health probe shouldn't wait through retries before flipping red
  });
}
