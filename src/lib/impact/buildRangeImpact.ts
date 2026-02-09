// src/lib/impact/buildRangeImpact.ts

import type { MobilityBucket } from "./buildTimeBuckets";

export function buildRangeImpact(
  buckets: MobilityBucket[],
  range: { start: number; end: number } // hour 단위
) {
  const from = range.start * 60;
  const to = range.end * 60 + 59;

  const inRange = buckets.filter(
    (b) => b.minute >= from && b.minute <= to
  );

  if (inRange.length === 0) {
    return {
      totalImpact: 0,
      peakMinute: null as number | null,
      peakValue: 0,
    };
  }

  const totalImpact = inRange.reduce(
    (sum, b) => sum + b.value,
    0
  );

  const peak = inRange.reduce(
    (max, b) => (b.value > max.value ? b : max),
    inRange[0]
  );

  return {
    totalImpact,
    peakMinute: peak.minute, // 🔥 핵심
    peakValue: peak.value,
  };
}
