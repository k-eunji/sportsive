// src/app/components/map-hero/HomeMapSnapCard.tsx
"use client";

import type { Event } from "@/types";
import { useMemo } from "react";
import { getVibe } from "@/lib/vibe";
import { track } from "@/lib/track";
import { useUserLocation, haversineKm } from "@/app/components/home/useUserLocation";
import { useDistanceUnit } from "@/app/components/home/useDistanceUnit";
import { formatDistance } from "@/lib/distance";

/* ---------------- helpers ---------------- */

function getAnchorDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function formatStartsLabel(e: any, now = new Date()) {
  const status = (e.status ?? "").toString().toUpperCase();
  if (status === "LIVE") return { tone: "live" as const, text: "LIVE" };

  const start = getAnchorDate(e);
  if (!start) return { tone: "upcoming" as const, text: "UPCOMING" };

  const diffMin = Math.round((start.getTime() - now.getTime()) / 60000);
  if (diffMin <= 0) return { tone: "upcoming" as const, text: "STARTED" };
  if (diffMin < 60) return { tone: "soon" as const, text: `IN ${diffMin} MIN` };

  const diffHr = Math.floor(diffMin / 60);
  return { tone: "soon" as const, text: `IN ${diffHr}H` };
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

function formatSessionRange(e: any, now = new Date()) {
  if (e.kind !== "session" || !e.startDate || !e.endDate) return null;

  const start = new Date(e.startDate);
  const end = new Date(e.endDate);

  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startLabel = start.toLocaleDateString(undefined, opts);
  const endLabel = end.toLocaleDateString(undefined, opts);

  const totalDays =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const dayIndex =
    now >= start && now <= end
      ? Math.floor(
          (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      : null;

  return {
    range: `${startLabel} – ${endLabel}`,
    dayIndex,
    totalDays,
  };
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
  const vibe = getVibe(e);

  const starts = useMemo(() => formatStartsLabel(e), [e]);
  const matchTime = useMemo(() => formatMatchTime(e), [e]);
  const session = useMemo(() => formatSessionRange(e), [e]);

  const { pos } = useUserLocation({ enabled: true });
  const { unit } = useDistanceUnit();

  const distance =
    pos && e.location
      ? haversineKm(pos, e.location)
      : null;

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

              {/* Team logos (non-tennis) */}
              {e.sport !== "tennis" && (e.homeTeamLogo || e.awayTeamLogo) && (
                <div className="flex items-center gap-1 mb-2">
                  {e.homeTeamLogo && (
                    <img
                      src={e.homeTeamLogo}
                      alt={e.homeTeam}
                      className="w-7 h-7 rounded-full bg-white"
                    />
                  )}
                  {e.awayTeamLogo && (                 
                    <img
                      src={e.awayTeamLogo}
                      alt={e.awayTeam}
                      className="w-7 h-7 rounded-full bg-white -ml-2"
                    />
                  )}
                </div>
              )}

              {/* Title */}
              <p className="text-lg font-semibold leading-tight truncate">
                {e.sport === "tennis"
                  ? e.title
                  : `${e.homeTeam} vs ${e.awayTeam}`}
              </p>

              {/* Absolute time (match only) */}
              {matchTime && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {matchTime}
                </p>
              )}

              {/* Session range (tennis only) */}
              {session && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {session.range}
                  {session.dayIndex && (
                    <> · Day {session.dayIndex} of {session.totalDays}</>
                  )}
                </p>
              )}

              {/* Meta row */}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {typeof distance === "number" && (
                  <span>{formatDistance(distance, unit)}</span>
                )}
                {e.sport && <span>{e.sport}</span>}
              </div>

              {/* Pills */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-muted/60">
                  {vibe.emoji && <span>{vibe.emoji}</span>}
                  <span>{vibe.label}</span>
                </span>

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
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
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
