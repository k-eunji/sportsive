// src/app/components/map-hero/HomeMapSnapCard.tsx
"use client";

import type { Event } from "@/types";
import { formatEventTimeWithOffsetUTC } from "@/utils/date";
import Link from "next/link";
import { useEffect } from "react";
import { getVibe, vibeClass } from "@/lib/vibe";
import { track } from "@/lib/track";
import { useMemo } from "react";



export default function HomeMapSnapCard({ event, onClose }: { event: Event; onClose: () => void }) {
  const e: any = event;
  const isLive = (e.status ?? "").toUpperCase() === "LIVE";
  const vibe = getVibe(e);

  const mapsHref = useMemo(() => {
    const lat = e.location?.lat;
    const lng = e.location?.lng;
    if (typeof lat !== "number" || typeof lng !== "number") return null;

    const dest = `${lat},${lng}`;
    // Google Maps directions deep link
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
  }, [e.location?.lat, e.location?.lng]);

  return (
    <div
      className="
        fixed left-0 right-0 z-[1000]
        bottom-[calc(env(safe-area-inset-bottom)+12px)]
        pb-[env(safe-area-inset-bottom)]
        bg-white dark:bg-black
        border-t
      "
      role="dialog"
      aria-label="Match quick view"
    >
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">
              {formatEventTimeWithOffsetUTC(new Date(e.date ?? e.utcDate))}
            </p>

            <p className="text-base font-semibold truncate mt-0.5">
              {e.sport === "tennis" ? e.title : `${e.homeTeam} vs ${e.awayTeam}`}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${vibeClass(
                  vibe.tone
                )}`}
              >
                {vibe.emoji ? `${vibe.emoji} ` : ""}
                {vibe.label}
              </span>

              <span
                className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
                  isLive
                    ? "text-red-600 bg-red-50 border-red-200"
                    : "text-gray-700 bg-gray-50 border-gray-200"
                }`}
              >
                {isLive ? "LIVE" : "UPCOMING"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              track("snapcard_closed", { eventId: e.id });
              onClose();
            }}
            className="text-sm font-semibold text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {mapsHref && (
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="
                w-full text-center
                rounded-2xl
                border
                bg-background
                px-4 py-3
                text-sm font-semibold
                hover:bg-muted/30
                transition
              "
              onClick={() => track("open_in_maps_clicked", { eventId: e.id })}
            >
              Open in Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}