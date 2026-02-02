// src/lib/eventToCard.ts

import type { Event } from "@/types";
import { getEventTimeState } from "@/lib/eventTime";

export interface EventCardModel {
  id: string;
  dateKey: string;
  title: string;
  subtitle?: string;
  logo?: string;
  state: string;
  event: Event;
}

export function eventToCard(e: Event): EventCardModel {
  const dateKey = (e.startDate ?? e.date).slice(0, 10);
  const state = getEventTimeState(e);

  /* =========================
     TITLE
     ========================= */

  let title = e.title ?? "Event";

  if (e.homeTeam) {
    title = e.homeTeam;
  }

  if (e.kind === "session" && e.venue) {
    title = e.venue;
  }

  /* =========================
     SUBTITLE (관계 정보만)
     - 팀 스포츠: vs away
     - ❌ sessionTime 제거
  ========================= */

  let subtitle: string | undefined;

  if (e.homeTeam && e.awayTeam) {
    subtitle = `vs ${e.awayTeam}`;
  }

  return {
    id: e.id,
    dateKey,
    title,
    subtitle,
    logo: e.homeTeamLogo ?? e.logo,
    state,
    event: e,
  };
}
