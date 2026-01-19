// src/app/components/home/WeekStrip.tsx
"use client";

import type { Event } from "@/types";
import { useMemo } from "react";

function getEventDate(e: any): Date | null {
  if (e.date) return new Date(e.date);
  if (e.utcDate) return new Date(e.utcDate);
  if (e.startDate) return new Date(e.startDate);
  return null;
}

function formatIsoForDisplay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function WeekStrip({
  events,
  onPickDay,
  activeIso,
}: {
  events: Event[];
  onPickDay?: (isoDate: string) => void;
  activeIso?: string | null;           // ✅ 추가
}) {
  const days = useMemo(() => {
    const now = new Date();
    const base = startOfDay(now);

    const buckets = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      return { d, iso, label, count: 0 };
    });

    for (const e of events as any[]) {
      const dt = getEventDate(e);
      if (!dt) continue;
      const iso = dt.toISOString().slice(0, 10);
      const idx = buckets.findIndex((b) => b.iso === iso);
      if (idx >= 0) buckets[idx].count += 1;
    }

    return buckets;
  }, [events]);

  return (
    <section className="w-full">
      <div className="w-full px-4 md:max-w-3xl md:mx-auto">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">This week</p>
          <p className="text-xs text-muted-foreground">Tap a day</p>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((x) => {
            const active = activeIso === x.iso;

            return (
              <button
                key={x.iso}
                onClick={() => onPickDay?.(x.iso)}
                className={[
                  "px-1 py-1 text-center transition",
                  active
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <p className={active ? "text-[11px] text-sky-700" : "text-[11px] text-muted-foreground"}>
                  {x.label}
                </p>
                <p className={active ? "text-sm font-semibold text-sky-900" : "text-sm font-semibold"}>
                  {x.count}
                </p>
              </button>
            );
          })}
        </div>

        {/* 선택된 날 표시 + 해제 버튼 (선택사항인데 강추) */}
        {activeIso && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium">{formatIsoForDisplay(activeIso)}</span>
            </p>
            <button
              onClick={() => onPickDay?.(activeIso)}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Clear
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
