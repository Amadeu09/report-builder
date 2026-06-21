import { AGGREGATE_ENTITY_NAME, SCOPE_LABELS, type ScopeNumber } from '../data/categories';
import type { OcfDataset, OcfEntity, OcfScopeData } from '../data/ocf';

export type ScopeSlice = {
  scope: ScopeNumber;
  label: string;
  total: number;
  share: number; // denominator: entity.totalEmissions
};

export type CategorySlice = {
  label: string;
  value: number;
  share: number; // denominator: scope3 total
  isOther: boolean;
  color: string; // 'var(--color-data-N)'
};

export type BarItem = {
  label: string;
  code?: string;
  value: number;
};

const DATA_COLORS = [
  'var(--color-data-1)',
  'var(--color-data-2)',
  'var(--color-data-3)',
  'var(--color-data-4)',
  'var(--color-data-5)',
] as const;

export function resolveEntity(dataset: OcfDataset, entityName: string): OcfEntity {
  if (entityName === AGGREGATE_ENTITY_NAME) return dataset.aggregate;
  return dataset.plants.find((p) => p.name === entityName) ?? dataset.aggregate;
}

export function scopeSlices(entity: OcfEntity): ScopeSlice[] {
  const total = entity.totalEmissions;
  return ([1, 2, 3] as const).map((scope) => ({
    scope,
    label: SCOPE_LABELS[scope],
    total: entity.scopes[scope].total,
    share: total > 0 ? entity.scopes[scope].total / total : 0,
  }));
}

export function scope3Slices(
  entity: OcfEntity,
  topN: number,
  sort: 'value-desc' | 'code-asc',
): CategorySlice[] {
  const scope3 = entity.scopes[3];
  const scope3Total = scope3.total;

  const cats = [...scope3.categories].filter((c) => c.value > 0);

  if (sort === 'value-desc') {
    cats.sort((a, b) => b.value - a.value);
  } else {
    cats.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }

  const top = cats.slice(0, topN);
  const rest = cats.slice(topN);

  const slices: CategorySlice[] = top.map((c, i) => ({
    label: c.label,
    value: c.value,
    share: scope3Total > 0 ? c.value / scope3Total : 0,
    isOther: false,
    color: DATA_COLORS[i % DATA_COLORS.length],
  }));

  if (rest.length > 0) {
    const otherValue = rest.reduce((s, c) => s + c.value, 0);
    slices.push({
      label: 'Other categories',
      value: otherValue,
      share: scope3Total > 0 ? otherValue / scope3Total : 0,
      isOther: true,
      color: 'var(--color-other)',
    });
  }

  return slices;
}

export function categoryBars(scopeData: OcfScopeData): BarItem[] {
  return [...scopeData.categories]
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((c) => ({ label: c.label, code: c.code, value: c.value }));
}

export function plantComparison(plants: OcfEntity[]): BarItem[] {
  return [...plants]
    .sort((a, b) => b.totalEmissions - a.totalEmissions)
    .map((p) => ({ label: p.name, value: p.totalEmissions }));
}
