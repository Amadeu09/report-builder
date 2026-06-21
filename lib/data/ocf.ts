import { CATEGORIES, AGGREGATE_ENTITY_NAME, type ScopeNumber, type CategoryKey } from './categories';
import type { OcfRow } from './schema';

export type OcfCategoryValue = {
  key: CategoryKey;
  code: string;
  label: string;
  value: number;
};

export type OcfScopeData = {
  total: number;
  categories: OcfCategoryValue[];
};

export type OcfEntity = {
  name: string;
  totalEmissions: number;
  scopes: Record<ScopeNumber, OcfScopeData>;
};

export type OcfDataset = {
  plants: OcfEntity[];
  aggregate: OcfEntity;
};


function getScopeTotal(row: OcfRow, scope: ScopeNumber): number {
  if (scope === 1) return row.total_scope_1;
  if (scope === 2) return row.total_scope_2;
  return row.total_scope_3;
}

function buildScopeData(row: OcfRow, scope: ScopeNumber): OcfScopeData {
  return {
    total: getScopeTotal(row, scope),
    categories: CATEGORIES.filter((c) => c.scope === scope).map((c) => ({
      key: c.key,
      code: c.code,
      label: c.label,
      value: row[c.key],
    })),
  };
}

function rowToEntity(row: OcfRow): OcfEntity {
  return {
    name: row.entity,
    totalEmissions: row.total_emissions,
    scopes: {
      1: buildScopeData(row, 1),
      2: buildScopeData(row, 2),
      3: buildScopeData(row, 3),
    },
  };
}

// O(n²) find-in-reduce: 3 plants × ≤24 categories — intentional at this scale.
function deriveAggregate(plants: OcfEntity[]): OcfEntity {
  const scopes: Record<ScopeNumber, OcfScopeData> = {
    1: { total: 0, categories: [] },
    2: { total: 0, categories: [] },
    3: { total: 0, categories: [] },
  };

  for (const scope of [1, 2, 3] as const) {
    const cats = CATEGORIES.filter((c) => c.scope === scope);
    scopes[scope] = {
      total: plants.reduce((sum, p) => sum + p.scopes[scope].total, 0),
      categories: cats.map((c) => ({
        key: c.key,
        code: c.code,
        label: c.label,
        value: plants.reduce((sum, p) => {
          const match = p.scopes[scope].categories.find((cv) => cv.key === c.key);
          return sum + (match?.value ?? 0);
        }, 0),
      })),
    };
  }

  return {
    name: AGGREGATE_ENTITY_NAME,
    totalEmissions: plants.reduce((sum, p) => sum + p.totalEmissions, 0),
    scopes,
  };
}

export function buildDataset(rows: OcfRow[], warnings: string[]): OcfDataset {
  const aggregateRow = rows.find((r) => r.entity === AGGREGATE_ENTITY_NAME);
  const plantRows = rows.filter((r) => r.entity !== AGGREGATE_ENTITY_NAME);
  const plants = plantRows.map(rowToEntity);

  let aggregate: OcfEntity;
  if (aggregateRow) {
    aggregate = rowToEntity(aggregateRow);
  } else {
    warnings.push(`"${AGGREGATE_ENTITY_NAME}" row missing — aggregate derived by summing plants.`);
    aggregate = deriveAggregate(plants);
  }

  return { plants, aggregate };
}
