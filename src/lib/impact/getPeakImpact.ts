//src/lib/impact/getPeakImpact.ts

export function getPeakImpact(
  buckets: { hour: number; value: number }[]
) {
  if (!buckets.length) return null;

  let peak = buckets[0];

  for (const b of buckets) {
    if (b.value > peak.value) {
      peak = b;
    }
  }

  if (peak.value === 0) return null;
  return peak;
}
