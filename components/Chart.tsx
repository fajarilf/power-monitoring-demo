"use client";

import { useState } from "react";

export type Series = {
  label: string;
  values: number[];
  color: string;
  areaFill?: string; // rgba fill under the line; omit for a plain line
  dash?: string;
};

export type Panel = {
  label: string; // left-edge axis caption, e.g. "kW"
  series: Series[];
  height: number; // px, of this panel's plot area
  yDomain?: [number, number]; // fixed range (e.g. PF clamped to 0.85-1.0); else auto from data
  hairline?: number; // horizontal reference line (e.g. PF target)
};

const WIDTH = 800;
const PAD = { top: 8, right: 12, bottom: 24, left: 48 };
const PANEL_GAP = 6;

// Catmull-Rom -> cubic bezier: the same curve family Chart.js draws with
// `tension`. Good enough for a hover-driven line chart; not trying to be a
// general spline library.
function smoothPath(points: [number, number][]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 === points.length ? i + 1 : i + 2];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// ponytail: plain per-point path, no downsampling — fine to a few thousand
// rows. Downsample only if someone starts filtering multi-month ranges.
export default function Chart({ panels, labels }: { panels: Panel[]; labels: string[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = labels.length;

  const totalHeight =
    PAD.top + panels.reduce((a, p) => a + p.height, 0) + PANEL_GAP * (panels.length - 1) + PAD.bottom;
  const plotW = WIDTH - PAD.left - PAD.right;
  const x = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * plotW);

  let top = PAD.top;
  const layout = panels.map((panel) => {
    const all = panel.series.flatMap((s) => s.values);
    const [dMin, dMax] = panel.yDomain ?? [Math.min(...all, 0), Math.max(...all, 1)];
    const pad = panel.yDomain ? 0 : (dMax - dMin) * 0.08 || 1;
    const min = dMin - pad;
    const max = dMax + pad;
    const panelTop = top;
    top += panel.height + PANEL_GAP;
    const y = (v: number) => panelTop + (1 - (v - min) / (max - min)) * panel.height;
    return { panel, panelTop, min, max, y };
  });

  const legend = panels.flatMap((p) => p.series);

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const i = Math.round(((px - PAD.left) / plotW) * (n - 1));
    setHover(Math.min(Math.max(i, 0), n - 1));
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      {legend.length >= 2 && (
        <div className="mb-3 flex flex-wrap gap-4 text-xs text-text-secondary">
          {legend.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5">
              <svg width="16" height="6" aria-hidden="true">
                <line x1="0" y1="3" x2="16" y2="3" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} />
              </svg>
              {s.label}
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${totalHeight}`}
          className="w-full"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        >
          {layout.map(({ panel, panelTop, min, max, y }, pi) => {
            const ticks = [min, (min + max) / 2, max];
            return (
              <g key={pi}>
                {ticks.map((v, ti) => (
                  <g key={ti}>
                    <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--grid)" strokeWidth="1" />
                    <text x={PAD.left - 8} y={y(v)} dy="0.32em" textAnchor="end" fontSize="10" fill="var(--text-dim)">
                      {v.toFixed(v !== 0 && Math.abs(v) < 10 ? 2 : 0)}
                    </text>
                  </g>
                ))}
                {panel.hairline !== undefined && (
                  <line
                    x1={PAD.left}
                    x2={WIDTH - PAD.right}
                    y1={y(panel.hairline)}
                    y2={y(panel.hairline)}
                    stroke="var(--text-dim)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                )}
                <text x={PAD.left} y={panelTop - 2} fontSize="10" fill="var(--text-dim)">
                  {panel.label}
                </text>

                {panel.series.map((s) => {
                  const points: [number, number][] = s.values.map((v, i) => [x(i), y(v)]);
                  const linePath = smoothPath(points);
                  return (
                    <g key={s.label}>
                      {s.areaFill && (
                        <path
                          d={`${linePath} L ${x(n - 1)},${panelTop + panel.height} L ${x(0)},${panelTop + panel.height} Z`}
                          fill={s.areaFill}
                          stroke="none"
                        />
                      )}
                      <path d={linePath} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={totalHeight - PAD.bottom} stroke="var(--border)" strokeWidth="1" />
          )}
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-2 rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-xs shadow-lg"
            style={{
              left: `${(x(hover) / WIDTH) * 100}%`,
              transform: x(hover) > WIDTH * 0.7 ? "translateX(-100%)" : undefined,
            }}
          >
            <div className="mb-1 font-mono text-text-dim">{labels[hover]}</div>
            {legend.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 font-mono tabular-nums">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.label}: {s.values[hover].toFixed(2)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
