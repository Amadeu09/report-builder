/** Convert kg CO₂e to kt CO₂e. Model stores raw kg; display always uses this. */
export function kgToKt(kg: number): number {
  return kg / 1_000_000;
}

/** Format kg value as a kt string with the given decimal places (default 3). */
export function formatKt(kg: number, decimals = 3): string {
  return `${kgToKt(kg).toFixed(decimals)} kt CO₂e`;
}
