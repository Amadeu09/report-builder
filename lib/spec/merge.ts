import type { ReportOptions } from '@/lib/report/options';

// Shallow merge: arrays (sections) are replaced, not concatenated.
export function mergeSpec(
  base: ReportOptions,
  partial: Partial<ReportOptions>,
): ReportOptions {
  return { ...base, ...partial };
}
