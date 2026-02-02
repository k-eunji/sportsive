///src/lib/eventDetailVM.ts

import type { Event } from "@/types";
import { getEventTimeState } from "@/lib/eventTime";

export type EventDetailStatus = "LIVE" | "SOON" | "UPCOMING";

export type EventDetailVM = {
  title: string;
  sport: string;
  league?: string;
  status: EventDetailStatus;
  dateText: string;
  timeText: string;
  city?: string;
  venue?: string;
  addressLine?: string;
  lat: number;
  lng: number;
  officialUrl?: string;
  isPaid?: boolean;
};

function normalizeStatus(
  s: ReturnType<typeof getEventTimeState>
): EventDetailStatus {
  if (s === "LIVE") return "LIVE";
  if (s === "SOON") return "SOON";
  return "UPCOMING"; // ENDED 포함 → UPCOMING으로 흡수
}

export function buildEventDetailVM(e: Event): EventDetailVM {
  const rawStatus = getEventTimeState(e);
  const status = normalizeStatus(rawStatus);

  // TITLE
  const title =
    e.homeTeam && e.awayTeam
      ? `${e.homeTeam} vs ${e.awayTeam}`
      : e.title ?? "Event";

  // DATE / TIME
  const start = new Date(e.date);
  const dateText = start.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let timeText = "All day";
  if (e.kind === "match") {
    timeText = start.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }

  return {
    title,
    sport: e.sport,
    league: e.competition,
    status, // ✅ 타입 에러 사라짐
    dateText,
    timeText,
    city: e.city,
    venue: e.venue,
    addressLine: e.city && e.region ? `${e.city}, ${e.region}` : e.city,
    lat: e.location.lat,
    lng: e.location.lng,
    officialUrl: e.homepageUrl,
    isPaid: e.isPaid,
  };
}
