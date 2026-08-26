import { NextResponse } from "next/server";

// Reports what lib/data.ts is actually backed by right now. Swap "mock" for
// a real upstream ping when getReadings() starts calling a meter API — the
// ConnectionStatus component doesn't need to change.
export function GET() {
  return NextResponse.json({ ok: true, source: "mock", ts: new Date().toISOString() });
}
