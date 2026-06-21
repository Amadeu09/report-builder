import { SectionHeader } from './shared/SectionHeader';
import { KeyFigure } from './shared/KeyFigure';
import { Donut, type DonutSlice } from './charts/Donut';
import { Bar } from './charts/Bar';
import { scopeSlices, plantComparison } from '@/lib/report/viewmodel';
import type { OcfDataset, OcfEntity } from '@/lib/data/ocf';
import { kgToKt } from '@/lib/data/format';

// Scope 3 gets data-1 (primary orange) — largest contributor gets most prominent colour.
const SCOPE_COLORS: Record<1 | 2 | 3, string> = {
  1: 'var(--color-data-3)',
  2: 'var(--color-data-2)',
  3: 'var(--color-data-1)',
};

type Props = { entity: OcfEntity; dataset: OcfDataset };

export function GlobalResults({ entity, dataset }: Props) {
  const donutSlices: DonutSlice[] = scopeSlices(entity).map((s) => ({
    label: s.label,
    value: s.total,
    share: s.share,
    color: SCOPE_COLORS[s.scope],
  }));

  const plantBars = plantComparison(dataset.plants);

  return (
    <section className="space-y-8 py-8">
      <SectionHeader>Global Results</SectionHeader>

      <KeyFigure label="Total GHG emissions" kg={entity.totalEmissions} />

      <div className="space-y-3">
        <h3 className="break-after-avoid text-h2 font-semibold text-ink">Emissions by scope</h3>
        <Donut
          slices={donutSlices}
          centerLabel={kgToKt(entity.totalEmissions).toFixed(2)}
          centerSub="kt CO₂e"
          aria="Donut chart showing GHG emissions split by scope"
        />
      </div>

      {plantBars.length > 0 && (
        <div className="space-y-3">
          <h3 className="break-after-avoid text-h2 font-semibold text-ink">Emissions by plant</h3>
          <Bar
            bars={plantBars}
            aria="Ranked bar chart comparing total GHG emissions across plants"
          />
        </div>
      )}
    </section>
  );
}
