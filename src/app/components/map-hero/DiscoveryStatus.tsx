// src/app/components/map-hero/DiscoveryStatus.tsx

"use client";

interface Props {
  discoveredCount: number;
  yesterdayCount?: number;
  justCelebrated?: boolean;
  returning?: boolean;
}

export default function DiscoveryStatus({
  discoveredCount,
  yesterdayCount = 0,
  justCelebrated = false,
  returning = false,
}: Props) {
  const line =
    discoveredCount === 0
      ? returning && yesterdayCount > 0
        ? `Yesterday you explored ${yesterdayCount}. Today might feel different.`
        : "Start anywhere. A match will surface."
      : discoveredCount === 1
      ? "One place uncovered."
      : discoveredCount === 2
      ? "Today is taking shape."
      : "Snapshot complete.";

  return (
    <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
      <p className="text-foreground font-medium">{line}</p>

      {justCelebrated && (
        <p className="text-sm font-semibold text-emerald-700">
          🎉 You’ve seen your area today.
        </p>
      )}
    </div>
  );
}
