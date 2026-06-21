import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseOcfCsv } from './parse';
import type { ParseResult } from './parse';

export function loadDataset(): ParseResult {
  const csvText = readFileSync(
    path.join(process.cwd(), 'data/sample_ocf_iso_14064.csv'),
    'utf-8',
  );
  return parseOcfCsv(csvText);
}
