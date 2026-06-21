import { readFileSync } from 'fs';
import { join } from 'path';
import { parseOcfCsv } from '../lib/data/parse';
import { formatKt, kgToKt } from '../lib/data/format';

const csvPath = join(process.cwd(), 'data', 'sample_ocf_iso_14064.csv');
const csvText = readFileSync(csvPath, 'utf8');

const { dataset, warnings } = parseOcfCsv(csvText);

console.log('=== DATASET ===');
for (const entity of [dataset.aggregate, ...dataset.plants]) {
  console.log(`\n${entity.name} — total: ${formatKt(entity.totalEmissions)}`);
  for (const scope of [1, 2, 3] as const) {
    const sd = entity.scopes[scope];
    console.log(`  Scope ${scope}: ${formatKt(sd.total)}`);
    for (const cat of sd.categories.filter((c) => c.value > 0)) {
      console.log(`    ${cat.code.padEnd(6)} ${cat.label.padEnd(45)} ${kgToKt(cat.value).toFixed(3)}`);
    }
  }
}

console.log('\n=== WARNINGS ===');
if (warnings.length === 0) {
  console.log('None — data is clean.');
} else {
  for (const w of warnings) console.log('⚠', w);
}
