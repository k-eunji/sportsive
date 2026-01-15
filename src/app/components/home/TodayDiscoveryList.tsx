//src/app/components/home/TodayDiscoveryList.tsx

"use client";

import type { Event } from "@/types";
import Link from "next/link";
import { formatEventTimeWithOffsetUTC } from "@/utils/date";
import { useMemo, useState } from "react";
import { getVibe, vibeClass } from "@/lib/vibe";
import { useUserLocation, haversineKm } from "./useUserLocation";
import { track } from "@/lib/track";
import type { ViewScope } from "./RadiusFilter";
import { formatDistance } from "@/lib/distance";
import { useDistanceUnit } from "./useDistanceUnit";
import { scopeToKm } from "@/lib/scopeDistance";
import { formatEventTimeCard } from "@/utils/formatEventTimeCard";
import { getEventTimingLabel } from "@/utils/getEventTimingLabel";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function TodayDiscoveryList({
  events,
  onPick,
  scope,
}: {
  events: Event[];
  onPick: (id: string) => void;
  scope: ViewScope;
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
      .filter((e) => {
        // match (축구/럭비 등)
        if (e.kind !== "session") {
          return e.__dt >= now && e.__dt <= in7;
        }

        // session (테니스)
        if (e.startDate && e.endDate) {
          const start = new Date(e.startDate);
          const end = new Date(e.endDate);
          return end >= now && start <= in7;
        }

        return false;
      })

      .sort((a, b) => a.__dt.getTime() - b.__dt.getTime());

    const todayList = cleaned.filter((e) => sameDay(e.__dt, today));
    const weekList = cleaned;

    return { todayList, weekList };
  }, [events]);

  const list = (mode === "today" ? view.todayList : view.weekList).filter(
    (e: any) => {
      if (scope === "global") return true;

      // ✅ 위치 아직 없으면 필터 안 함
      if (!pos) return true;

      if (!e.location?.lat || !e.location?.lng) return false;

      const d = haversineKm(pos, {
        lat: e.location.lat,
        lng: e.location.lng,
      });

      return d <= scopeToKm(scope);
    }
  );
  console.log("pos:", pos);

  return (
    <section className="px-6">
      <div className="md:max-w-3xl mx-auto space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {scope === "global"
                ? mode === "today"
                  ? "Happening around the world today"
                  : "Next 7 days around the world"
                : mode === "today"
                ? "Today around you"
                : "Next 7 days around you"}
            </p>

            <p className="text-xs text-gray-500 truncate">Tap a match to view on the map</p>
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
          {list.map((e: any) => {
            const dt = e.__dt as Date;
            const isLive = (e.status ?? "").toUpperCase() === "LIVE";

            const vibe = getVibe(e);
            const dist =
              pos && e.location?.lat && e.location?.lng
                ? haversineKm(pos, { lat: e.location.lat, lng: e.location.lng })
                : null;

            return (
              <div
                key={e.id}
                role="button"
                tabIndex={0}
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
                  cursor-pointer
                "
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    {/* ✅ 1. vibe를 카드의 제목으로 승격 */}
                    <p className="text-sm font-semibold leading-snug line-clamp-2">
                      {e.sport === "tennis"
                        ? e.title
                        : `${e.homeTeam} vs ${e.awayTeam}`}
                    </p>

                    {e.sport === "tennis" && e.startDate && e.endDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ongoing · {e.startDate} → {e.endDate}
                      </p>
                    )}

                    <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                      {/* 시간 */}
                      <div className="leading-snug">
                        {formatEventTimeCard(dt, e.region)}
                      </div>

                      {/* 거리 + 종목 */}
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                        {typeof dist === "number" && (
                          <span>{formatDistance(dist, unit)}</span>
                        )}

                        {e.sport && (
                          <span className="font-medium">
                            {e.sport === "football" && "⚽ Football"}
                            {e.sport === "rugby" && "🏉 Rugby"}
                            {e.sport === "tennis" && "🎾 Tennis"}
                            {e.sport === "f1" && "🏎️ F1"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${vibeClass(vibe.tone)}`}>
                        {getEventTimingLabel(dt)}
                      </span>

                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                        isLive ? "text-red-600 bg-red-50 border-red-200" : "text-gray-600 bg-gray-50 border-gray-200"
                      }`}>
                        {isLive ? "LIVE" : "Quiet"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation(); // ✅ 카드 onClick(지도 열기) 막기
                      track("directions_clicked", { eventId: e.id });

                      const lat = e.location?.lat;
                      const lng = e.location?.lng;
                      if (!lat || !lng) return;

                      // Google Maps directions
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                      window.open(url, "_blank");
                    }}
                    className="
                      ml-auto
                      self-start
                      rounded-full
                      px-3 py-1.5
                      text-xs font-semibold
                      text-blue-600
                      hover:bg-blue-50
                    "
                  >
                    Directions →
                  </button>


                </div>
              </div>
            );
          })}

          {list.length === 0 && (
            <div className="rounded-2xl border px-4 py-4 text-sm text-gray-500 space-y-1">
              <p>
                {scope === "global"
                  ? "Nothing surfaced globally right now."
                  : "This area is quiet right now."}
              </p>
              <p className="text-xs">
                {scope === "global"
                  ? "Try switching back to nearby or city."
                  : "It usually doesn’t stay that way."}
              </p>
            </div>
          )}

        </div>
        <button
          onClick={() => setMode("week")}
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          Show the next 7 days →
        </button>

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
