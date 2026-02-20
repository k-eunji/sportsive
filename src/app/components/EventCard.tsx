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
    timeLabel,
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
        cursor-pointer

        /* 📱 MOBILE — 카드 스타일 */
        rounded-none
        bg-card
        shadow-sm
        border border-border/50
        active:scale-[0.98]
        active:shadow-none

        /* 🖥 DESKTOP — 기존 스타일 유지 */
        md:rounded-none
        md:bg-transparent
        md:shadow-none
        md:border-0
        md:active:scale-100
        md:hover:bg-muted/40
        md:hover:shadow-sm
        md:hover:scale-[1.01]

        ${isCompleted ? "opacity-50 md:hover:scale-100 md:hover:shadow-none md:hover:bg-transparent" : ""}
      `}
    >

      <div className="flex items-center gap-4 py-4 px-4 md:px-2">

        {/* VISUAL */}
        <div
          className={[
            "relative w-10 h-10 rounded-md overflow-hidden flex items-center justify-center transition",
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
  
        {/* 1행: 타이틀 + 시간 */}
        <div className="space-y-1">
          <div className="truncate font-semibold">
            {card.title}
          </div>

          {card.subtitle && (
            <div className="truncate flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">vs</span>
              <span className="truncate font-medium">
                {card.subtitle}
              </span>
            </div>
          )}
        </div>

        {/* 2행: 메타 + 상태 */}
        <div className="flex items-center justify-between gap-3 mt-1">
          {meta && (
            <div className="text-sm text-muted-foreground truncate">
              {meta}
            </div>
          )}

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
        </div>

        <div className="sr-only">
          {card.title} in {card.event.city} on {card.event.date}
        </div>


      </div>
      
        <span className="
          ml-3
          text-muted-foreground

          /* 모바일: 항상 보임 */
          opacity-70

          /* 데스크탑: hover 때만 강조 */
          md:opacity-0
          md:group-hover:opacity-100

          transition
        ">
          ›
        </span>

      </div>
    </Link>
  );
}
