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

function timeBucket(dt: Date) {
  const now = new Date();
  if (dt.toDateString() === now.toDateString()) return "Today";
  if (dt.getTime() - now.getTime() < 1000 * 60 * 60 * 24 * 2)
    return "Later this week";
  return "Coming up";
}

export default function TodayDiscoveryList({
  events,
  onPick,
  scope,
  observerMode,
  observerRegion,
  observerCity,
}: {
  events: Event[];
  onPick: (id: string) => void;
  scope: ViewScope;
  observerMode: boolean;
  observerRegion?: string | null;
  observerCity?: string | null;
}) {

  const { pos } = useUserLocation({
    enabled: !observerMode,
  });

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
  }, [events]);

  const list = useMemo(() => {
    const now = new Date();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 7);

    return (events as any[])
      .map(e => ({
        ...e,
        __dt: new Date(e.date ?? e.utcDate ?? Date.now()),
      }))
      .filter(e => e.__dt >= now && e.__dt <= horizon)
      .sort((a, b) => a.__dt.getTime() - b.__dt.getTime());
  }, [events]);


  console.log("pos:", pos);

  return (
    <section className="w-full">
      <div className="w-full px-4 md:max-w-3xl md:mx-auto space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {observerMode
                ? "Across places · Next 7 days"
                : scope === "global"
                ? "Around the world"
                : "Near you"}
            </p>

            {observerMode && (
              <button
                onClick={() => {
                  track("observer_try_nearby");
                  // 여기서만 위치 요청을 트리거
                  navigator.geolocation.getCurrentPosition(() => {
                    window.location.reload();
                  });
                }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                See what’s closest to you →
              </button>
            )}

            <p className="text-xs text-gray-500 truncate">
              {observerMode
                ? "Tap a match to explore details"
                : "Tap a match to view on the map"}
            </p>

          </div>
        </div>

        <div className="space-y-2">
          {(() => {
            let lastBucket = "";

            return list.map((e: any) => {
              const dt = e.__dt as Date;
              const bucket = timeBucket(dt);
              const showBucket = bucket !== lastBucket;
              lastBucket = bucket;

              const isLive = (e.status ?? "").toUpperCase() === "LIVE";
              const vibe = getVibe(e);
              const dist =
                !observerMode && pos && e.location?.lat && e.location?.lng
                  ? haversineKm(pos, { lat: e.location.lat, lng: e.location.lng })
                  : null;

              return (
                <div key={e.id}>
                  {showBucket && (
                    <p className="text-xs font-semibold text-gray-500 mt-4 mb-1">
                      {bucket}
                    </p>
                  )}

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      track("list_item_clicked", { eventId: e.id });
                      onPick(e.id);
                    }}
                    className="
                      w-full
                      py-3
                      border-b border-border/40
                      hover:bg-muted/40
                      transition
                      cursor-pointer
                    "
                  >

                    <div className="flex items-start gap-3">
                      {/* Logos (match only) */}
                      {e.sport !== "tennis" && (e.homeTeamLogo || e.awayTeamLogo) && (
                        <div className="flex items-center gap-1 shrink-0 mt-0.5">
                          {e.homeTeamLogo ? (
                            <img
                              src={e.homeTeamLogo}
                              alt={e.homeTeam}
                              className="w-7 h-7 rounded-full object-cover border"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full border bg-muted/40" />
                          )}

                          {e.awayTeamLogo ? (
                            <img
                              src={e.awayTeamLogo}
                              alt={e.awayTeam}
                              className="w-7 h-7 rounded-full object-cover border -ml-2"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full border bg-muted/40 -ml-2" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-snug line-clamp-2">
                          {e.sport === "tennis"
                            ? e.title
                            : `${e.homeTeam} vs ${e.awayTeam}`}
                        </p>

                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatEventTimeCard(dt, e.region)}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {typeof dist === "number" && (
                            <span>{formatDistance(dist, unit)}</span>
                          )}
                          {e.sport && <span>{e.sport}</span>}
                        </div>

                        <div className="mt-1 flex gap-2">
                          <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${vibeClass(vibe.tone)}`}>
                            {getEventTimingLabel(dt)}
                          </span>

                          <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                            isLive
                              ? "text-red-600 bg-red-50 border-red-200"
                              : "text-emerald-700 bg-emerald-50 border-emerald-200"
                          }`}>
                            {isLive ? "LIVE" : "OPEN"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
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
