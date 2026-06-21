import { kgToKt } from '@/lib/data/format';

export function KeyFigure({ label, kg }: { label: string; kg: number }) {
  return (
    <div className="break-inside-avoid rounded-lg border border-rule bg-surface p-5">
      <div className="text-caption text-slate">{label}</div>
      <div className="mt-1 text-display font-semibold text-ink">
        {kgToKt(kg).toFixed(2)}{' '}
        <span className="text-h2 font-normal text-slate">kt CO₂e</span>
      </div>
    </div>
  );
}
