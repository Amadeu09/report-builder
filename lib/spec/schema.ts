import { z } from 'zod';
import type { ReportOptions } from '@/lib/report/options';
import { DEFAULT_OPTIONS } from '@/lib/report/options';

export const ReportSpecSchema = z.object({
  entity: z.string().min(1),
  // Values mirror SectionId in lib/report/options.ts — keep in sync.
  sections: z.array(
    z.enum([
      'cover',
      'intro',
      'methodology',
      'global-results',
      'scope-1',
      'scope-2',
      'scope-3',
      'conclusions',
    ]),
  ),
  // 17 = number of scope-3 entries in CATEGORIES registry.
  scope3TopN: z.number().int().min(1).max(17),
  scope3Sort: z.enum(['value-desc', 'code-asc']),
});

// Compile-time: z.infer must be bidirectionally assignable to ReportOptions.
// Catches schema/type drift (e.g. a new field added to one but not the other).
type _Inferred = z.infer<typeof ReportSpecSchema>;
type _Assert = _Inferred extends ReportOptions
  ? ReportOptions extends _Inferred
    ? true
    : never
  : never;
const _specAssert: _Assert = true;
void _specAssert;

// Runtime: fail fast on import if DEFAULT_OPTIONS violates schema constraints
// (e.g. scope3TopN out of range, empty entity). Type narrowing cannot catch these.
ReportSpecSchema.parse(DEFAULT_OPTIONS);
