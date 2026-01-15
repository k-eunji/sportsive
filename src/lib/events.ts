// src/lib/events.ts

import { supabase } from "../lib/supabaseServer";
import type { Event } from "@/types/event";

/* ────────────────────────── */
/* types */
/* ────────────────────────── */

export type Sport = "football" | "rugby" | "tennis";

/* ────────────────────────── */
/* utils */
/* ────────────────────────── */

const cleanTeamName = (name?: string | null) =>
  (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

function getMatchTable(sport: Sport) {
  if (sport === "rugby") return "england_rugby_matches";
  return "england_pl_football_matches";
}

function formatMatch(m: any): Event {
  return {
    id: String(m.id),
    kind: "match",

    date: m.date,
    sport: (m.sport || "football").toLowerCase(),

    status: m.status,
    competition: m.competition ?? "",

    homeTeam: cleanTeamName(m.home_team?.name),
    awayTeam: cleanTeamName(m.away_team?.name),

    homeTeamLogo: m.home_team?.logo_url,
    awayTeamLogo: m.away_team?.logo_url,

    venue: m.home_team?.venue,

    // ✅ Event 필수 필드들 채워줌
    location: {
      lat: m.home_team?.lat ?? null,
      lng: m.home_team?.lng ?? null,
    },

    city: m.home_team?.city,
    region: m.home_team?.region,

    free: false,                // discovery 기본값
    organizerId: "system",      // 시스템 이벤트
    attendees: [],              // 아직 참가자 없음

    // 선택 필드들
    teams: [
      cleanTeamName(m.home_team?.name),
      cleanTeamName(m.away_team?.name),
    ],
  };
}

const BASE_SELECT = `
  id,
  date,
  status,
  competition,
  sport,
  home_team_id,
  away_team_id,
  home_team:home_team_id (
    name,
    logo_url,
    venue,
    lat,
    lng,
    region,
    city
  ),
  away_team:away_team_id (
    name,
    logo_url
  )
`;

/* ────────────────────────── */
/* tennis loader (session) */
/* ────────────────────────── */

async function getTennisSessions(): Promise<Event[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/england/tennis`,
      { cache: "no-store" }
    );

    if (!res.ok) return [];

    const json = await res.json();
    return (json.matches ?? []) as Event[];
  } catch (err) {
    console.error("❌ getTennisSessions error:", err);
    return [];
  }
}

/* ────────────────────────── */
/* unified API */
/* ────────────────────────── */

export async function getEventById(
  eventId: string,
  sport: Sport
): Promise<Event | null> {
  if (sport === "tennis") {
    const sessions = await getTennisSessions();
    return sessions.find((e) => e.id === eventId) ?? null;
  }

  const { data, error } = await supabase
    .from(getMatchTable(sport))
    .select(BASE_SELECT)
    .eq("id", eventId)
    .single();

  if (error || !data) {
    console.error("❌ getEventById error:", error);
    return null;
  }

  return formatMatch(data);
}

/* ────────────────────────── */

export async function getAllEvents(
  sport: Sport
): Promise<Event[]> {
  if (sport === "tennis") {
    return getTennisSessions();
  }

  const { data, error } = await supabase
    .from(getMatchTable(sport))
    .select(BASE_SELECT)
    .order("date", { ascending: true });

  if (error) {
    console.error("❌ getAllEvents error:", error);
    return [];
  }

  return (data ?? []).map(formatMatch);
}

/* ────────────────────────── */

export async function getUpcomingEvents(
  sport: Sport,
  limit = 5
): Promise<Event[]> {
  if (sport === "tennis") {
    const sessions = await getTennisSessions();
    const now = new Date();
    return sessions
      .filter((e) => new Date(e.date) >= now)
      .slice(0, limit);
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(getMatchTable(sport))
    .select(BASE_SELECT)
    .gte("date", now)
    .order("date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("❌ getUpcomingEvents error:", error);
    return [];
  }

  return (data ?? []).map(formatMatch);
}

/* ────────────────────────── */

export async function getTodaysEvents(
  sport: Sport
): Promise<Event[]> {
  const today = new Date();
  const start = today.toISOString().slice(0, 10) + "T00:00:00.000Z";
  const end = today.toISOString().slice(0, 10) + "T23:59:59.999Z";

  if (sport === "tennis") {
    const sessions = await getTennisSessions();
    return sessions.filter((e) => {
      if (!e.startDate || !e.endDate) return false;
      return e.endDate >= start.slice(0, 10) &&
             e.startDate <= end.slice(0, 10);
    });
  }

  const { data, error } = await supabase
    .from(getMatchTable(sport))
    .select(BASE_SELECT)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (error) {
    console.error("❌ getTodaysEvents error:", error);
    return [];
  }

  return (data ?? []).map(formatMatch);
}

/* ────────────────────────── */

export async function getEventsWithin7Days(
  sport: Sport
): Promise<Event[]> {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (sport === "tennis") {
    const sessions = await getTennisSessions();
    return sessions.filter((e) => {
      if (!e.startDate || !e.endDate) return false;
      const s = new Date(e.startDate);
      const en = new Date(e.endDate);
      return en >= now && s <= end;
    });
  }

  const { data, error } = await supabase
    .from(getMatchTable(sport))
    .select(BASE_SELECT)
    .gte("date", now.toISOString())
    .lte("date", end.toISOString())
    .order("date", { ascending: true });

  if (error) {
    console.error("❌ getEventsWithin7Days error:", error);
    return [];
  }

  return (data ?? []).map(formatMatch);
}
