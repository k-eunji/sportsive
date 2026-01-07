//src/app/components/home/TodayDiscoveryList.tsx

"use client";

import type { Event } from "@/types";
import Link from "next/link";
import { formatEventTimeWithOffsetUTC } from "@/utils/date";
import { useMemo, useState } from "react";
import { getVibe, vibeClass } from "@/lib/vibe";
import { useUserLocation, haversineKm } from "./useUserLocation";
import { track } from "@/lib/track";
import type { RadiusKm } from "./RadiusFilter";
import { formatDistance } from "@/lib/distance";
import { useDistanceUnit } from "./useDistanceUnit";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function TodayDiscoveryList({
  events,
  onPick,
  radiusKm,
}: {
  events: Event[];
  onPick: (id: string) => void;
  radiusKm: RadiusKm;
}) {
  const [mode, setMode] = useState<"today" | "week">("today");
  const { pos } = useUserLocation();
  const { unit } = useDistanceUnit();

  const view = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);

    const cleaned = (events as any[])
      .map((e) => ({
        ...e,
        __dt: new Date(e.date ?? e.utcDate ?? Date.now()),
      }))
      .filter((e) => e.__dt >= now && e.__dt <= in7)
      .sort((a, b) => a.__dt.getTime() - b.__dt.getTime());

    const todayList = cleaned.filter((e) => sameDay(e.__dt, today));
    const weekList = cleaned;

    return { todayList, weekList };
  }, [events]);

  const list = (mode === "today" ? view.todayList : view.weekList).filter((e: any) => {
    if (!pos || !e.location?.lat || !e.location?.lng) return true;
    const d = haversineKm(pos, { lat: e.location.lat, lng: e.location.lng });
    return d <= radiusKm;
    });

  return (
    <section className="px-6">
      <div className="md:max-w-3xl mx-auto space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {mode === "today" ? "Today near you" : "Next 7 days near you"}
            </p>
            <p className="text-xs text-gray-500 truncate">Tap a match to jump into the map</p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setMode("today");
                track("list_filter_changed", { mode: "today" });
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                mode === "today" ? "bg-black text-white border-black" : "bg-transparent text-gray-600"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                setMode("week");
                track("list_filter_changed", { mode: "week" });
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                mode === "week" ? "bg-black text-white border-black" : "bg-transparent text-gray-600"
              }`}
            >
              7 days
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {list.slice(0, 6).map((e: any) => {
            const dt = e.__dt as Date;
            const isLive = (e.status ?? "").toUpperCase() === "LIVE";

            const vibe = getVibe(e);
            const dist =
              pos && e.location?.lat && e.location?.lng
                ? haversineKm(pos, { lat: e.location.lat, lng: e.location.lng })
                : null;

            return (
              <button
                key={e.id}
                onClick={() => {
                  track("list_item_clicked", { eventId: e.id });
                  onPick(e.id);
                }}
                className="
                  w-full text-left
                  rounded-2xl border border-border/60
                  bg-background/60 backdrop-blur
                  shadow-sm shadow-black/5
                  px-4 py-3
                  hover:bg-background/80
                  transition
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {/* ✅ 1. vibe를 카드의 제목으로 승격 */}
                    <p className="text-sm font-semibold truncate">
                      {vibe.emoji ? `${vibe.emoji} ` : ""}{vibe.label}
                    </p>

                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {e.homeTeam} vs {e.awayTeam} · {formatEventTimeWithOffsetUTC(dt)}
                      {typeof dist === "number" ? ` · ${formatDistance(dist, unit)}` : ""}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${vibeClass(vibe.tone)}`}>
                        {mode === "today" ? "Today" : "Next 7 days"}
                      </span>

                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                        isLive ? "text-red-600 bg-red-50 border-red-200" : "text-gray-600 bg-gray-50 border-gray-200"
                      }`}>
                        {isLive ? "LIVE" : "Quiet"}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-blue-600 shrink-0">Open →</span>

                </div>
              </button>
            );
          })}

          {list.length === 0 && (
            <div className="rounded-2xl border px-4 py-4 text-sm text-gray-500">
              Nothing showing in this window. Try switching to <strong>7 days</strong>.
            </div>
          )}
        </div>

        <Link
          href="/events"
          className="block text-sm font-semibold text-blue-600 hover:underline underline-offset-4 pt-1"
        >
          Open full map →
        </Link>
      </div>
    </section>
  );
}
