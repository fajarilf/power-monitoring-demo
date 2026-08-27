import { apiGet } from "@/lib/api-client";
import type { Device } from "./devices.types";

export async function getDevices(): Promise<Device[]> {
  return apiGet<Device[]>("/api/devices", {});
}
