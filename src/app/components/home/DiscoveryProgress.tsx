// src/app/components/home/DiscoveryProgress.tsx

"use client";

export default function DiscoveryProgress({
  count,
  justCelebrated,
  ritualLine,
}: {
  count: number;
  justCelebrated: boolean;
  ritualLine: string | null;
}) {
  if (count === 0 && !ritualLine) return null;

  const headline =
    count === 0
      ? null
      : count === 1
      ? "That’s one place uncovered."
      : count === 2
      ? "You’re seeing the shape of today."
      : "Today feels complete.";

  const line =
    ritualLine ??
    (count === 0
      ? "You don’t need a reason. Just look around."
      : "This changes daily. A quick look tomorrow feels different.");

  return (
    <section className="px-6">
      <div className="md:max-w-3xl mx-auto text-center space-y-2">
        {headline && (
          <p className="text-sm font-medium text-foreground">
            {headline}
          </p>
        )}

        {justCelebrated && (
          <p className="text-sm font-semibold text-emerald-700">
            🎉 Snapshot completed.
          </p>
        )}

        <p className="text-[11px] text-muted-foreground">
          {line}
        </p>
      </div>
    </section>
  );
}
