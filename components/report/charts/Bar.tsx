import type { BarItem } from '@/lib/report/viewmodel';
import { kgToKt } from '@/lib/data/format';

type Props = {
  bars: BarItem[];
  aria: string;
  color?: string;
};

const LABEL_W = 210;
const TRACK_W = 300;
const VALUE_W = 72;
const TOTAL_W = LABEL_W + TRACK_W + VALUE_W + 8;
const ROW_H = 30;
const PAD = 8;

const TRUNCATE_AT = 30;

function trunc(s: string): string {
  return s.length > TRUNCATE_AT ? s.slice(0, TRUNCATE_AT - 1) + '…' : s;
}

export function Bar({ bars, aria, color = 'var(--color-data-1)' }: Props) {
  if (bars.length === 0) return null;

  const max = Math.max(...bars.map((b) => b.value));
  const totalH = bars.length * ROW_H + PAD * 2;

  return (
    <div className="break-inside-avoid">
    <svg
      viewBox={`0 0 ${TOTAL_W} ${totalH}`}
      width="100%"
      role="img"
      aria-label={aria}
      style={{ maxWidth: TOTAL_W }}
    >
      {bars.map((bar, i) => {
        const y = PAD + i * ROW_H;
        const barW = max > 0 ? (bar.value / max) * TRACK_W : 0;
        const label = bar.code ? `${bar.code} ${trunc(bar.label)}` : trunc(bar.label);

        return (
          <g key={i}>
            <text
              x={LABEL_W - 6}
              y={y + ROW_H / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fill="var(--color-slate)"
            >
              {label}
            </text>
            <rect
              x={LABEL_W}
              y={y + 5}
              width={barW}
              height={ROW_H - 10}
              fill={color}
              rx={2}
            />
            <text
              x={LABEL_W + barW + 5}
              y={y + ROW_H / 2}
              dominantBaseline="middle"
              fontSize={9}
              fill="var(--color-slate)"
            >
              {kgToKt(bar.value).toFixed(2)} kt
            </text>
          </g>
        );
      })}
    </svg>
    </div>
  );
}
