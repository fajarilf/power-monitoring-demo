import { LiveClock } from "./live-clock";
import { ConnectionStatus } from "./connection-status";

export function AppHeader() {
  return (
    <header className="border-b border-border-soft bg-gradient-to-b from-[#0d0f12] to-background">
      <div className="mx-auto flex max-w-6xl items-center gap-7 px-8 py-[18px]">
        <div className="flex items-center gap-2.5 font-display text-sm font-semibold tracking-wide">
          <span className="flex gap-[3px]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-phase-r" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-phase-s" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-phase-t" />
          </span>
          GRID/MON
        </div>
        <div className="ml-auto flex items-center gap-5">
          <LiveClock />
          <ConnectionStatus />
        </div>
      </div>
    </header>
  );
}
