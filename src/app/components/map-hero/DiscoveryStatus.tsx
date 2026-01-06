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
  return (
    <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
      <p>
        Today: <strong>{discoveredCount}</strong> matches explored
        {yesterdayCount > 0 && (
          <span className="opacity-70"> · Yesterday {yesterdayCount}</span>
        )}
      </p>

      {discoveredCount === 0 && (
        <p className="text-xs opacity-70">
          Most of these don’t appear on major sports platforms.
        </p>
      )}

      {justCelebrated && (
        <p className="text-sm font-medium text-green-700">
          🎉 You’ve seen how sport looks in your area today.
        </p>
      )}

      {returning && discoveredCount === 0 && yesterdayCount > 0 && (
        <p className="text-xs opacity-70">
          Yesterday was active — today might be different.
        </p>
      )}
    </div>
  );
}
