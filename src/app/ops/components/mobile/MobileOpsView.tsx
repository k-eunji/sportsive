//src/app/ops/components/mobile/MobileOpsView.tsx

"use client";

import { useState, useMemo } from "react";
import DatePresetBar from "@/app/ops/components/home/DatePresetBar";
import type { AttentionLevel } from "@/lib/infra/attentionLevel";
import type { Event } from "@/types";
import { getEventTimeState } from "@/lib/eventTime";

type Factor = {
  label: string;
  count: number;
};

type Props = {
  peakHour: number | null;
  peakCount: number;
  scopeLabel: string;
  dateLabel: string;
  attentionLevel: AttentionLevel | null;

  baselineStats?: {
    todayCount: number;
    median: number;
    delta: number;
    absoluteDiff: number;
    label: "normal" | "elevated" | "unusual";
  } | null;

  events: Event[];

  activeDate: Date;
  onDateChange: (d: Date) => void;
};

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export default function MobileOpsView({
  peakHour,
  peakCount,
  scopeLabel,
  dateLabel,
  attentionLevel,
  baselineStats,
  events,
  activeDate,
  onDateChange,
}: Props) {

  const [listOpen, setListOpen] = useState(false);

  const levelColor =
    attentionLevel === "high"
      ? "from-red-500 to-red-600"
      : attentionLevel === "medium"
      ? "from-amber-400 to-amber-500"
      : "from-emerald-400 to-emerald-500";

  const activityLabel =
    attentionLevel === "high"
      ? "High overlap expected"
      : attentionLevel === "medium"
      ? "Moderate overlap expected"
      : "Low overlap expected";

  const sortedEvents = useMemo(() => {
    const priority = (e: Event) => {
      const state = getEventTimeState(e);

      if (state === "LIVE") return 0;
      if (state === "SOON") return 1;
      if (state === "UPCOMING") return 2;
      if (state === "ENDED") return 3;

      return 4;
    };

    return [...events].sort((a, b) => {
      const pDiff = priority(a) - priority(b);
      if (pDiff !== 0) return pDiff;

      const da = getStartDate(a);
      const db = getStartDate(b);
      if (!da || !db) return 0;

      return da.getTime() - db.getTime();
    });
  }, [events]);

  return (
    <div
      className="
        md:hidden
        fixed
        inset-x-0
        bottom-14
        z-40
        h-[180px]
      "
    >
      <div className="h-full bg-background rounded-t-3xl shadow-2xl p-4 flex flex-col">

        {!listOpen ? (
          <>
            {/* SUMMARY */}
            <div className={`rounded-2xl p-4 text-white bg-gradient-to-br ${levelColor}`}>
              <p className="text-xs uppercase opacity-80">
                {scopeLabel} · {dateLabel}
              </p>

              <p className="text-lg font-semibold mt-1">
                {activityLabel}
              </p>

              {peakHour !== null && (
                <p className="text-sm opacity-90 mt-1">
                  Peak {peakHour}:00 · {peakCount} events
                </p>
              )}

              {baselineStats && (
                <p className="text-xs mt-2 opacity-90">
                  {baselineStats.todayCount} events ·{" "}
                  {baselineStats.delta > 0
                    ? `+${baselineStats.delta}% vs norm`
                    : `${baselineStats.delta}% vs norm`}
                </p>
              )}
            </div>

            {/* DATE + BUTTON */}
            <div className="mt-3 flex justify-between items-center">
              <DatePresetBar
                activeDate={activeDate}
                onChange={onDateChange}
                maxDays={60}
              />

              <button
                onClick={() => setListOpen(true)}
                className="text-sm font-medium text-primary"
              >
                List view
              </button>
            </div>
          </>
        ) : (
          <>
            {/* LIST HEADER */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">
                {scopeLabel} · {dateLabel}
              </p>
              <button
                onClick={() => setListOpen(false)}
                className="text-xs text-muted-foreground"
              >
                Close
              </button>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto border-t pt-2 space-y-2">
              {sortedEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No events scheduled.
                </p>
              )}

              {sortedEvents.map((e) => {
                const start = getStartDate(e);
                const time = start
                  ? start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                const state = getEventTimeState(e);
                const isEnded = state === "ENDED";
                const isLive = state === "LIVE";

                return (
                  <div
                    key={e.id}
                    className={[
                      "p-3 rounded-lg border transition text-sm",
                      isLive ? "border-red-400 bg-red-50/40" : "border-transparent",
                      isEnded ? "opacity-60 text-muted-foreground" : "",
                    ].join(" ")}
                  >
                    <div className="font-medium truncate">
                      {e.homeTeam && e.awayTeam
                        ? `${e.homeTeam} vs ${e.awayTeam}`
                        : e.title}
                    </div>

                    <div className="text-xs text-muted-foreground flex justify-between mt-1">
                      <span>{time}</span>
                      <span className="capitalize">{e.sport}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}