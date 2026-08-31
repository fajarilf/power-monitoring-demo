// The only file in this codebase that reads process.env directly
// (AGENTS.md §8). Every other module gets configuration through here.
//
// ponytail: NEXT_PUBLIC_* values are frozen at build time — changing this in
// a deploy environment does nothing without a rebuild, and anything behind
// this prefix is readable by anyone who opens devtools. Never put a secret here.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env.local.");
}

// MQTT is optional: unset means the live KPI panel shows "offline" instead
// of breaking the whole app/build the way a missing apiBaseUrl does.
export const env = {
  apiBaseUrl,
  mqttUrl: process.env.NEXT_PUBLIC_MQTT_URL,
  mqttTopic: process.env.NEXT_PUBLIC_MQTT_TOPIC,
};
