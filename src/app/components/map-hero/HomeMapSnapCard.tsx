// src/app/components/map-hero/HomeMapSnapCard.tsx
"use client";

import type { Event } from "@/types";
import { formatEventTimeWithOffsetUTC } from "@/utils/date";
import Link from "next/link";
import { useEffect } from "react";
import { getVibe, vibeClass } from "@/lib/vibe";
import { track } from "@/lib/track";

function logLocalEventView(eventId: string) {
  try {
    const key = `sportsive_event_views_${eventId}`;
    const raw = localStorage.getItem(key);
    const arr = raw ? (JSON.parse(raw) as number[]) : [];
    arr.push(Date.now());
    localStorage.setItem(key, JSON.stringify(arr.slice(-5)));
  } catch {}
}

function getLocalEventViewLabel(eventId: string) {
  try {
    const raw = localStorage.getItem(`sportsive_event_views_${eventId}`);
    if (!raw) return "Someone might be nearby";

    const arr = JSON.parse(raw) as number[];
    const last = arr[arr.length - 1];
    const sec = Math.floor((Date.now() - last) / 1000);

    if (sec < 20) return "Someone just opened this";
    if (sec < 60) return "Someone was here a moment ago";
    return "People pass through this from time to time";
  } catch {
    return "Someone might be nearby";
  }
}

export default function HomeMapSnapCard({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const e: any = event;
  const isLive = (e.status ?? "").toUpperCase() === "LIVE";
  const vibe = getVibe(e);

  useEffect(() => {
    logLocalEventView(e.id);
  }, [e.id]);

  return (
    <div
      className="
        fixed left-0 right-0 z-40
        bottom-[calc(env(safe-area-inset-bottom)+58px)]
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

              <p className="text-[11px] text-muted-foreground">
                {getLocalEventViewLabel(e.id)}
              </p>
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
          <Link
            href={`/events?focus=${e.id}`}
            onClick={() =>
              track("details_opened", { eventId: e.id, source: "snapcard" })
            }
            className="
              w-full text-center
              rounded-2xl
              bg-primary text-primary-foreground
              px-4 py-3
              text-sm font-semibold
              shadow-sm shadow-black/10
              hover:opacity-95
              transition
            "
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
}
