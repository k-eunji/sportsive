// src/app/ops/components/map-hero/HomeMapSnapCard.tsx

"use client";

import type { Event } from "@/types";
import { useMemo } from "react";
import { track } from "@/lib/track";
import {
  useUserLocation,
  haversineKm,
} from "@/app/ops/components/home/useUserLocation";
import { useDistanceUnit } from "@/app/ops/components/home/useDistanceUnit";
import { formatDistance } from "@/lib/distance";
import { getEventTimeState } from "@/lib/eventTime";

/* ---------------- helpers ---------------- */

function getAnchorDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function formatStartsLabel(e: any) {
  const state = getEventTimeState(e);
  if (state === "LIVE") return { tone: "live" as const, text: "LIVE" };
  if (state === "SOON") return { tone: "soon" as const, text: "STARTING SOON" };
  if (state === "UPCOMING")
    return { tone: "upcoming" as const, text: "UPCOMING" };
  return { tone: "ended" as const, text: "ENDED" };
}

function formatMatchTime(e: any) {
  if (e.kind === "session") return null;
  const d = getAnchorDate(e);
  if (!d) return null;

  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isHorseRacing(e: any) {
  return (
    typeof e.sport === "string" &&
    e.sport.replace(/\s+/g, "-").toLowerCase() === "horse-racing"
  );
}

function formatHorseRacingTime(e: any) {
  if (!isHorseRacing(e)) return null;
  if (!e.startDate || !e.endDate) return null;

  const start = new Date(e.startDate);
  const end = new Date(e.endDate);

  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };

  return `${start.toLocaleTimeString(undefined, timeOpts)}–${end.toLocaleTimeString(
    undefined,
    timeOpts
  )}`;
}

/* ---------------- component ---------------- */

export default function HomeMapSnapCard({
  event,
  onClose,
}: {
  event: Event;
  onClose: () => void;
}) {
  const e: any = event;

  const starts = useMemo(() => formatStartsLabel(e), [e]);
  const matchTime = useMemo(() => formatMatchTime(e), [e]);

  const { pos } = useUserLocation({ enabled: true });
  const { unit } = useDistanceUnit();

  const distance =
    pos && e.location ? haversineKm(pos, e.location) : null;

  const mapsHref = useMemo(() => {
    const { lat, lng } = e.location ?? {};
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }, [e.location]);

  const ticketHref = useMemo(() => {
    if (!e.homepageUrl) return null;
    return (
      `/api/go/ticket` +
      `?eventId=${e.id}` +
      `&sport=${e.sport ?? ""}` +
      `&city=${e.city ?? ""}` +
      `&source=infra_card` +
      `&target=${encodeURIComponent(e.homepageUrl)}`
    );
  }, [e]);

  return (
    <div
      className="
        absolute
        left-1/2
        bottom-6
        -translate-x-1/2
        z-50
        pointer-events-auto
      "
      role="dialog"
    >

      <div className="w-[240px] rounded-xl bg-background/90 backdrop-blur-xl shadow-lg">
        <div className="px-3 py-2.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Title */}
              <p className="text-sm font-semibold leading-tight truncate">
                {e.kind === "session"
                  ? e.title
                  : e.sport === "tennis" || e.sport === "darts"
                  ? e.title
                  : `${e.homeTeam} vs ${e.awayTeam}`}
              </p>

              {/* Time */}
              {(matchTime || isHorseRacing(e)) && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isHorseRacing(e)
                    ? formatHorseRacingTime(e)
                    : matchTime}
                </p>
              )}

              {/* Meta */}
              <div className="mt-1 text-xs text-muted-foreground">
                {typeof distance === "number" && (
                  <span>{formatDistance(distance, unit)}</span>
                )}
                {e.city && <span> · {e.city}</span>}
                {e.sport && <span> · {e.sport}</span>}
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => {
                track("infra_card_closed", { eventId: e.id });
                onClose();
              }}
              className="w-8 h-8 rounded-full text-muted-foreground hover:bg-muted/50"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            {/* Status */}
            <span
              className={[
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                starts.tone === "live"
                  ? "bg-red-500/15 text-red-600"
                  : starts.tone === "soon"
                  ? "bg-amber-500/15 text-amber-700"
                  : "bg-muted/60 text-muted-foreground",
              ].join(" ")}
            >
              {starts.text}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {mapsHref && (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground underline underline-offset-2"
                >
                  Maps
                </a>
              )}

              {mapsHref && ticketHref && <span>·</span>}

              {ticketHref && (
                <a
                  href={ticketHref}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground underline underline-offset-2"
                >
                  Source
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
