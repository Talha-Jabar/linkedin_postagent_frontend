import { useState } from "react";

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  /** Shown in the tooltip under the value, e.g. "4 posts measured". */
  detail: string;
}

/** Round the axis maximum up to a clean step so ticks read 0 / 2% / 4% … */
function niceScale(max: number, tickCount = 4): { max: number; step: number } {
  if (max <= 0) return { max: 0.01, step: 0.0025 };
  const raw = max / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  const step = nice * magnitude;
  return { max: step * Math.ceil(max / step), step };
}

/**
 * Horizontal bar chart, single series in one hue (no legend - the title names it).
 * Bars <= 20px, 4px rounded data-end, square at the baseline, value at the tip,
 * hairline gridlines, per-bar tooltip on hover and keyboard focus.
 */
export function BarChart({
  data,
  formatValue,
  formatTick,
  ariaLabel,
}: {
  data: BarDatum[];
  /** Bar tips and tooltips: full precision, matching the table. */
  formatValue: (value: number) => string;
  /** Axis ticks: only as many decimals as the step needs. */
  formatTick: (value: number, step: number) => string;
  ariaLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const { max, step } = niceScale(Math.max(...data.map((d) => d.value)));
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const pct = (value: number) => `${(value / max) * 100}%`;

  return (
    <figure aria-label={ariaLabel}>
      <ul>
        {data.map((d) => (
          <li key={d.key} className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
            <span className="truncate text-right text-sm text-ink-2" title={d.label}>
              {d.label}
            </span>
            <div className="relative h-9">
              {/* Plot area leaves room on the right for the tip label. */}
              <div className="absolute inset-y-0 left-0 right-16">
                {ticks.map((t) => (
                  <span key={t} aria-hidden className="absolute inset-y-0 w-px bg-viz-grid" style={{ left: pct(t) }} />
                ))}
                <button
                  type="button"
                  className={`absolute top-1/2 left-0 h-5 -translate-y-1/2 rounded-r-[4px] bg-viz-1 transition-[filter] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-text ${
                    active === d.key ? "brightness-110" : ""
                  }`}
                  style={{ width: `max(2px, ${pct(d.value)})` }}
                  aria-label={`${d.label}: ${formatValue(d.value)}, ${d.detail}`}
                  onPointerEnter={() => setActive(d.key)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(d.key)}
                  onBlur={() => setActive(null)}
                />
                <span
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 pl-2 text-xs tabular-nums text-ink-2"
                  style={{ left: pct(d.value) }}
                >
                  {formatValue(d.value)}
                </span>
                {active === d.key && (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full z-10 mb-1 -translate-x-1/2 rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-lg"
                    style={{ left: `min(${pct(d.value)}, 85%)` }}
                  >
                    <p className="text-sm font-semibold text-ink tabular-nums">{formatValue(d.value)}</p>
                    <p className="whitespace-nowrap text-ink-2">{d.label}</p>
                    <p className="whitespace-nowrap text-ink-3">{d.detail}</p>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {/* Axis */}
      <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[12rem_minmax(0,1fr)]" aria-hidden>
        <span />
        <div className="relative h-5">
          <div className="absolute inset-y-0 left-0 right-16">
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute top-0 -translate-x-1/2 text-[11px] tabular-nums text-ink-3"
                style={{ left: pct(t) }}
              >
                {formatTick(t, step)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
