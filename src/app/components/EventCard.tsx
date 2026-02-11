// src/app/components/EventCard.tsx

import Link from "next/link";
import { EventCardModel } from "@/lib/eventToCard";
import { getEventTimeState } from "@/lib/eventTime";
import { formatEventTimeShort } from "@/utils/date";
import { sportEmoji } from "@/lib/sportEmoji";
import { normalizeSportKey } from "@/lib/normalizeSport";
import { getEventMarker } from "@/lib/eventMarker";

export function EventCard({ card }: { card: EventCardModel }) {
  const state = getEventTimeState(card.event);
  const isCompleted = state === "ENDED";

  const sportKey = normalizeSportKey(card.event.sport);
  const emoji = sportEmoji[sportKey];
  const marker = getEventMarker(
    card.event.sport,
    card.event.kind
  );

  


  /* =========================
     TIME LABEL
  ========================= */

  let timeLabel = "";

  if (sportKey === "horseracing") {
    // 경마: 세션 라벨 자체가 시간 의미
    timeLabel = card.event.payload?.sessionTime ?? "";

  } else if (card.event.kind === "session") {
    // 🎯 테니스 / 다트: 시작 시각만 표시
    const t = card.event.payload?.typicalStartTime;
    timeLabel = t ? `Starts ~${t}` : "";

  } else {
    // 일반 경기
    timeLabel = formatEventTimeShort(card.event.date);
  }

  /* =========================
     META (도시 우선)
  ========================= */

  const meta = [
    card.event.city,
    card.subtitle,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/event/${card.event.id}`}
      className={`
        group
        block
        transition
        hover:bg-muted/40
        hover:shadow-sm
        hover:scale-[1.01]
        cursor-pointer
        ${isCompleted ? "opacity-50 hover:scale-100 hover:shadow-none hover:bg-transparent" : ""}
      `}

    >

      <div className="flex items-center gap-3 py-3 px-2">
        {/* VISUAL */}
        <div
          className={[
            "relative w-12 h-12 rounded overflow-hidden flex items-center justify-center transition",
            state === "LIVE"
              ? "ring-2 ring-red-500"
              : state === "SOON"
              ? "ring-2 ring-amber-400"
              : "bg-muted/40",
            isCompleted ? "grayscale opacity-60" : "",
          ].join(" ")}
        >

          {marker && (
            <span className="absolute top-0 left-0 text-[10px] font-bold bg-black text-white px-1 rounded-br">
              {marker}
            </span>
          )}

          {card.logo ? (
            <img
              src={card.logo}
              alt=""
              className="w-full h-full object-contain"
            />
          ) : emoji ? (
            <span className="text-2xl">{emoji}</span>
          ) : (
            <span className="text-lg font-semibold">
              {card.title.charAt(0)}
            </span>
          )}
        </div>

        {/* TEXT */}
        <div className={`flex-1 min-w-0 ${isCompleted ? "text-muted-foreground" : ""}`}>

          <div className="font-medium truncate group-hover:underline">
            {card.title}
          </div>

          {meta && (
            <div className="text-sm font-medium text-muted-foreground truncate">
              {meta}
            </div>
          )}

          {timeLabel && (
            <div className="text-xs text-muted-foreground">
              {timeLabel}
            </div>
          )}
        </div>

        {/* STATE (보조 신호) */}
        {state === "LIVE" && (
          <span className="text-xs font-semibold text-red-600">
            LIVE
          </span>
        )}
        {state === "SOON" && (
          <span className="text-xs font-semibold text-amber-600">
            SOON
          </span>
        )}

        {isCompleted && (
          <span className="text-xs font-semibold text-muted-foreground">
            FINISHED
          </span>
        )}

        <span className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition">
          →
        </span>
      </div>
    </Link>
  );
}
