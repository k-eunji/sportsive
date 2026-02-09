// lib/infra/peak.ts
type Bucket = { hour: number; count: number };

export function getPeakBucket(buckets: Bucket[]) {
  if (!buckets.length) return null;

  let peak = buckets[0];
  for (const b of buckets) {
    if (b.count > peak.count) peak = b;
  }

  if (peak.count === 0) return null;
  return peak;
}
