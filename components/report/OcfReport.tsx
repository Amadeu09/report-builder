import type { OcfDataset } from '@/lib/data/ocf';
import type { ReportOptions } from '@/lib/report/options';
import { resolveEntity } from '@/lib/report/viewmodel';
import { Cover } from './Cover';
import { Intro } from './Intro';
import { Methodology } from './Methodology';
import { GlobalResults } from './GlobalResults';
import { Scope } from './Scope';
import { Conclusions } from './Conclusions';

// Year not in the CSV — 2024 matches the sample dataset period.
const REPORT_YEAR = 2024;

type Props = { data: OcfDataset; options: ReportOptions };

export function OcfReport({ data, options }: Props) {
  const entity = resolveEntity(data, options.entity);

  return (
    <article className="bg-white font-report text-ink">
      {options.sections.map((sectionId) => {
        switch (sectionId) {
          case 'cover':
            return (
              <Cover key={sectionId} entityName={entity.name} year={REPORT_YEAR} />
            );
          case 'intro':
            return <Intro key={sectionId} />;
          case 'methodology':
            return <Methodology key={sectionId} />;
          case 'global-results':
            return (
              <GlobalResults key={sectionId} entity={entity} dataset={data} />
            );
          case 'scope-1':
            return (
              <Scope key={sectionId} scopeNum={1} entity={entity} options={options} />
            );
          case 'scope-2':
            return (
              <Scope key={sectionId} scopeNum={2} entity={entity} options={options} />
            );
          case 'scope-3':
            return (
              <Scope key={sectionId} scopeNum={3} entity={entity} options={options} />
            );
          case 'conclusions':
            return <Conclusions key={sectionId} entity={entity} />;
          default:
            return null;
        }
      })}
    </article>
  );
}
