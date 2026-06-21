import { SectionHeader } from './shared/SectionHeader';
import { formatKt, kgToKt } from '@/lib/data/format';
import { categoryBars } from '@/lib/report/viewmodel';
import type { OcfEntity } from '@/lib/data/ocf';

type Props = { entity: OcfEntity };

export function Conclusions({ entity }: Props) {
  const scope3Share = entity.totalEmissions > 0
    ? entity.scopes[3].total / entity.totalEmissions
    : 0;
  const top3 = categoryBars(entity.scopes[3]).slice(0, 3);

  return (
    <section className="space-y-4 py-8">
      <SectionHeader>Conclusions</SectionHeader>
      <p className="text-body leading-relaxed text-ink">
        {entity.name} recorded total GHG emissions of{' '}
        <strong>{formatKt(entity.totalEmissions)}</strong> during the reporting year.
        Scope 3 represents <strong>{(scope3Share * 100).toFixed(1)}%</strong> of total
        emissions ({kgToKt(entity.scopes[3].total).toFixed(2)} kt CO₂e), making the
        value chain the dominant source and primary lever for future reductions.
      </p>
      {top3.length > 0 && (
        <p className="text-body leading-relaxed text-ink">
          The three largest Scope 3 contributors are{' '}
          <strong>{top3.map((b) => b.label).join(', ')}</strong>, which together account
          for{' '}
          <strong>
            {entity.scopes[3].total > 0
              ? ((top3.reduce((s, b) => s + b.value, 0) / entity.scopes[3].total) * 100).toFixed(1)
              : '0.0'}
            %
          </strong>{' '}
          of Scope 3 emissions.
        </p>
      )}
      <p className="border-t border-rule pt-4 text-caption text-slate">
        Prepared by Footprint Mappa · GHG Protocol Corporate Standard / ISO 14064-1
      </p>
    </section>
  );
}
