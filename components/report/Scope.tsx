import { SectionHeader } from './shared/SectionHeader';
import { KeyFigure } from './shared/KeyFigure';
import { Donut } from './charts/Donut';
import { Bar } from './charts/Bar';
import { scope3Slices, categoryBars } from '@/lib/report/viewmodel';
import type { OcfEntity } from '@/lib/data/ocf';
import type { ReportOptions } from '@/lib/report/options';
import { SCOPE_LABELS, type ScopeNumber } from '@/lib/data/categories';
import { kgToKt } from '@/lib/data/format';

type Props = {
  scopeNum: ScopeNumber;
  entity: OcfEntity;
  options: ReportOptions;
};

export function Scope({ scopeNum, entity, options }: Props) {
  const scopeData = entity.scopes[scopeNum];
  const bars = categoryBars(scopeData);

  return (
    <section className="space-y-8 py-8">
      <SectionHeader>{SCOPE_LABELS[scopeNum]}</SectionHeader>

      <KeyFigure label={`${SCOPE_LABELS[scopeNum]} total`} kg={scopeData.total} />

      {scopeNum === 3 ? (
        <>
          <div className="space-y-3">
            <h3 className="break-after-avoid text-h2 font-semibold text-ink">Emissions by category</h3>
            <Donut
              slices={scope3Slices(entity, options.scope3TopN, options.scope3Sort)}
              centerLabel={kgToKt(scopeData.total).toFixed(2)}
              centerSub="kt CO₂e"
              aria="Donut chart showing Scope 3 GHG emissions by category"
            />
          </div>
          <div className="space-y-3">
            <h3 className="break-after-avoid text-h2 font-semibold text-ink">Full category breakdown</h3>
            <Bar bars={bars} aria="Ranked bar chart of all Scope 3 categories by emissions" />
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <h3 className="break-after-avoid text-h2 font-semibold text-ink">Category breakdown</h3>
          <Bar
            bars={bars}
            aria={`Ranked bar chart of Scope ${scopeNum} categories by emissions`}
          />
        </div>
      )}
    </section>
  );
}
