// src/app/components/map-hero/HomeMapSnapCard.tsx
"use client";

import type { Event } from "@/types";
import { formatEventTimeWithOffsetUTC } from "@/utils/date";
import { useMemo } from "react";
import { getVibe } from "@/lib/vibe";
import { track } from "@/lib/track";

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function formatStartsLabel(e: any, now = new Date()) {
  const status = (e.status ?? "").toString().toUpperCase();
  if (status === "LIVE") return { tone: "live" as const, text: "LIVE" };

  const start = getStartDate(e);
  if (!start) return { tone: "upcoming" as const, text: "UPCOMING" };

  const diffMin = Math.round((start.getTime() - now.getTime()) / 60000);
  if (diffMin <= 0) return { tone: "upcoming" as const, text: "STARTED" };
  if (diffMin < 60) return { tone: "soon" as const, text: `IN ${diffMin} MIN` };

  const diffHr = Math.floor(diffMin / 60);
  return { tone: "soon" as const, text: `IN ${diffHr}H` };
}

export default function HomeMapSnapCard({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const e: any = event;
  const vibe = getVibe(e);

  const starts = useMemo(() => formatStartsLabel(e), [e]);

  const mapsHref = useMemo(() => {
    const { lat, lng } = e.location ?? {};
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }, [e.location]);

  return (
    <div
      className="
        fixed inset-x-0 z-[1000]
        bottom-[calc(env(safe-area-inset-bottom)+12px)]
        px-4
      "
      role="dialog"
      aria-label="Event quick view"
    >
      <div
        className="
          max-w-3xl mx-auto
          rounded-3xl
          bg-white/85 dark:bg-black/80
          backdrop-blur-xl
          shadow-[0_-8px_40px_rgba(0,0,0,0.12)]
        "
      >
        <div className="px-5 py-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground tracking-wide">
                {formatEventTimeWithOffsetUTC(
                  new Date(e.date ?? e.utcDate ?? e.startDate)
                )}
              </p>

              <p className="text-lg font-semibold leading-tight mt-0.5 truncate">
                {e.sport === "tennis"
                  ? e.title
                  : `${e.homeTeam} vs ${e.awayTeam}`}
              </p>

              {/* Pills */}
              <div className="mt-3 flex flex-wrap gap-2">
                {/* vibe */}
                <span
                  className="
                    inline-flex items-center gap-1
                    rounded-full px-2.5 py-1
                    text-[11px] font-medium
                    bg-muted/60
                  "
                >
                  {vibe.emoji && <span>{vibe.emoji}</span>}
                  <span>{vibe.label}</span>
                </span>

                {/* time / live */}
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    starts.tone === "live"
                      ? "bg-red-500/15 text-red-600"
                      : starts.tone === "soon"
                      ? "bg-amber-500/15 text-amber-700"
                      : "bg-muted/60 text-muted-foreground",
                  ].join(" ")}
                >
                  {starts.text}
                </span>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => {
                track("snapcard_closed", { eventId: e.id });
                onClose();
              }}
              className="
                text-sm font-medium
                text-muted-foreground
                hover:text-foreground
              "
            >
              ✕
            </button>
          </div>

          {/* CTA */}
          {mapsHref && (
            <div className="mt-5">
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  track("get_directions_clicked", { eventId: e.id })
                }
                className="
                  block w-full
                  rounded-2xl
                  bg-foreground
                  text-background
                  text-center
                  py-3
                  text-sm font-semibold
                  hover:opacity-90
                  transition
                "
              >
                Get directions
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
