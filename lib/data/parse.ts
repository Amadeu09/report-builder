import Papa from 'papaparse';
import { OcfRowSchema, type OcfRow } from './schema';
import { buildDataset, type OcfDataset } from './ocf';

export type ParseResult = {
  dataset: OcfDataset;
  warnings: string[];
};

const RELATIVE_TOL = 0.001; // 0.1%
const ABSOLUTE_TOL = 0.01;  // 10g CO₂e — used when expected value is 0

function withinTolerance(actual: number, expected: number): boolean {
  if (expected === 0) return Math.abs(actual) <= ABSOLUTE_TOL;
  return Math.abs(actual - expected) / expected <= RELATIVE_TOL;
}

export function parseOcfCsv(csvText: string): ParseResult {
  const warnings: string[] = [];

  const { data: rawRows } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const validRows: OcfRow[] = [];
  for (const raw of rawRows) {
    const result = OcfRowSchema.safeParse(raw);
    if (result.success) {
      validRows.push(result.data as OcfRow);
    } else {
      const entity = raw['entity'] ?? '(unknown)';
      warnings.push(`Row "${entity}": validation failed — ${result.error.message}`);
    }
  }

  const dataset = buildDataset(validRows, warnings);

  // Runtime consistency check — surface data anomalies without blocking render
  for (const entity of [dataset.aggregate, ...dataset.plants]) {
    let scopeSum = 0;
    for (const scope of [1, 2, 3] as const) {
      const sd = entity.scopes[scope];
      const catSum = sd.categories.reduce((s, c) => s + c.value, 0);
      if (!withinTolerance(catSum, sd.total)) {
        warnings.push(
          `[${entity.name}] Scope ${scope}: categories sum ${catSum.toFixed(3)} ≠ scope total ${sd.total.toFixed(3)}`
        );
      }
      scopeSum += sd.total;
    }
    if (!withinTolerance(scopeSum, entity.totalEmissions)) {
      warnings.push(
        `[${entity.name}] Scope totals ${scopeSum.toFixed(3)} ≠ total_emissions ${entity.totalEmissions.toFixed(3)}`
      );
    }
  }

  return { dataset, warnings };
}
