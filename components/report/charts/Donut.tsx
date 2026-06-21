import { kgToKt } from '@/lib/data/format';

export type DonutSlice = {
  label: string;
  value: number; // kg
  share: number; // fraction (0-1)
  color: string; // 'var(--color-data-N)'
};

type Props = {
  slices: DonutSlice[];
  centerLabel: string;
  centerSub: string;
  aria: string;
};

const CX = 100;
const CY = 100;
const R = 80;
const STROKE_W = 24;
const GAP_DEG = 1.5;

function polarToCart(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number): string {
  const clamped = Math.min(endDeg, startDeg + 359.9);
  const start = polarToCart(startDeg);
  const end = polarToCart(clamped);
  const large = clamped - startDeg > 180 ? 1 : 0;
  return (
    `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} ` +
    `A ${R} ${R} 0 ${large} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`
  );
}

export function Donut({ slices, centerLabel, centerSub, aria }: Props) {
  const visible = slices.filter((s) => s.share > 0.001);
  let deg = 0;

  const arcs = visible.map((s) => {
    const fullSpan = s.share * 360;
    const drawSpan = Math.max(0, fullSpan - GAP_DEG);
    const startDeg = deg + GAP_DEG / 2;
    const d = arcPath(startDeg, startDeg + drawSpan);
    deg += fullSpan;
    return { ...s, d };
  });

  return (
    <div className="break-inside-avoid flex flex-col gap-6 sm:flex-row sm:items-start">
      <svg
        viewBox="0 0 200 200"
        width={200}
        height={200}
        role="img"
        aria-label={aria}
        className="shrink-0"
      >
        {/* Background ring */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth={STROKE_W}
        />
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.d}
            fill="none"
            stroke={arc.color}
            strokeWidth={STROKE_W}
            strokeLinecap="butt"
          />
        ))}
        {/* Centre label */}
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          fontSize={18}
          fontWeight="600"
          fill="var(--color-ink)"
        >
          {centerLabel}
        </text>
        <text
          x={CX}
          y={CY + 13}
          textAnchor="middle"
          fontSize={10}
          fill="var(--color-slate)"
        >
          {centerSub}
        </text>
      </svg>

      <ul className="flex flex-col gap-2 text-body">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-sm"
              style={{ background: s.color }}
            />
            <span className="flex-1 text-ink">{s.label}</span>
            <span className="ml-4 tabular-nums text-slate">
              {kgToKt(s.value).toFixed(2)} kt
            </span>
            <span className="w-14 text-right tabular-nums text-slate">
              {(s.share * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
