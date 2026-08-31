"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import mqtt from "mqtt";
import { env } from "@/config/env";
import { toLiveReading } from "../utils/map-measurement";
import type { LiveReading, MqttMeasurement } from "../api/measurements.types";

export type LiveStatus = "connecting" | "live" | "offline";

export interface UseLiveReadingResult {
  reading: LiveReading | null;
  status: LiveStatus;
}

const LiveReadingContext = createContext<UseLiveReadingResult>({ reading: null, status: "offline" });

// One MQTT connection for the whole app — the header status dot and the KPI
// cards both read it through context instead of each opening their own.
export function LiveReadingProvider({ children }: { children: ReactNode }) {
  const [reading, setReading] = useState<LiveReading | null>(null);
  const [status, setStatus] = useState<LiveStatus>(env.mqttUrl && env.mqttTopic ? "connecting" : "offline");

  useEffect(() => {
    if (!env.mqttUrl || !env.mqttTopic) return;
    const topic = env.mqttTopic;

    const client = mqtt.connect(env.mqttUrl);
    client.on("connect", () => {
      setStatus("live");
      client.subscribe(topic);
    });
    client.on("reconnect", () => setStatus("connecting"));
    client.on("close", () => setStatus("offline"));
    client.on("error", () => setStatus("offline"));
    client.on("message", (_topic, payload) => {
      try {
        const msg = JSON.parse(payload.toString()) as MqttMeasurement;
        setReading(toLiveReading(msg));
      } catch {
        // malformed frame — skip it, keep the last good reading on screen
      }
    });

    return () => {
      client.end(true);
    };
  }, []);

  return <LiveReadingContext.Provider value={{ reading, status }}>{children}</LiveReadingContext.Provider>;
}

export function useLiveReading(): UseLiveReadingResult {
  return useContext(LiveReadingContext);
}
