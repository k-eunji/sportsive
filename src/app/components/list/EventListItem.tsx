//src/app/components/list/EventListItem.tsx

"use client";

import type { Event } from "@/types";
import { useMemo } from "react";
import { getEventTimeState } from "@/lib/eventTime";
import { getVibe } from "@/lib/vibe";

function getAnchorDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function formatMatchTime(e: any) {
  if (e.kind === "session") return null;
  const d = getAnchorDate(e);
  if (!d) return null;

  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatHorseRacingSession(e: any) {
  if (e.sport !== "horse-racing" || e.kind !== "session") return null;

  const label = e.payload?.sessionTime;
  const start = new Date(e.startDate);
  const end = new Date(e.endDate);

  if (!label || isNaN(start.getTime()) || isNaN(end.getTime())) {
    return label ?? null;
  }

  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };

  return `${label} · ${start.toLocaleTimeString(undefined, opts)}–${end.toLocaleTimeString(undefined, opts)}`;
}

export default function EventListItem({
  event,
  onClick,
}: {
  event: Event;
  onClick?: () => void;
}) {
  const e: any = event;

  const vibe = getVibe(e);
  const state = getEventTimeState(e);
  const time = formatMatchTime(e);
  const horseSession = formatHorseRacingSession(e);

  const title = (() => {
    // 🐎 Horse racing: meeting / venue 중심
    if (e.sport === "horse-racing") {
        if (e.title && e.code) return `${e.title} · ${e.code}`;
        if (e.title) return e.title;
        return "Horse racing";
    }

    // 🎯 Darts / 🎾 Tennis: session / tournament
    if (e.sport === "darts" || e.sport === "tennis") {
        return e.title ?? "Event";
    }

    // ⚽️ 🏉 Match sports
    if (e.homeTeam && e.awayTeam) {
        return `${e.homeTeam} vs ${e.awayTeam}`;
    }

    // 🔒 최종 안전망
    return e.title ?? "Event";
    })();

  return (
    <button
      onClick={onClick}
      className="
        w-full
        text-left
        px-4 py-3
        rounded-xl
        hover:bg-muted/50
        transition
        flex items-start gap-3
      "
    >
      {/* TIME */}
      <div className="w-14 shrink-0 text-xs font-semibold text-muted-foreground">
        {time ?? "—"}
      </div>

      {/* MAIN */}
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{title}</p>

        {horseSession && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {horseSession}
          </p>
        )}

        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{e.sport}</span>
          <span>·</span>
          <span>{e.city}</span>
        </div>
      </div>

      {/* STATUS */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        <span
          className={[
            "text-[11px] font-semibold",
            state === "LIVE"
              ? "text-red-600"
              : state === "SOON"
              ? "text-amber-600"
              : "text-muted-foreground",
          ].join(" ")}
        >
          {state}
        </span>

        <span className="text-[11px] opacity-70">
          {vibe.emoji}
        </span>
      </div>
    </button>
  );
}
