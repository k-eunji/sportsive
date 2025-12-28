// src/lib/events.ts

import { supabase } from "../lib/supabaseServer";

/* ────────────────────────── */
/* utils */
/* ────────────────────────── */

const cleanTeamName = (name?: string | null) =>
  (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

function formatMatch(m: any) {
  return {
    id: String(m.id),
    date: m.date,
    sport: (m.sport || "football").toLowerCase(),
    status: m.status,
    competition: m.competition ?? "",
    homeTeam: cleanTeamName(m.home_team?.name),
    awayTeam: cleanTeamName(m.away_team?.name),
    homeTeamLogo: m.home_team?.logo_url,
    awayTeamLogo: m.away_team?.logo_url,
    venue: m.home_team?.venue,
    location: {
      lat: m.home_team?.lat,
      lng: m.home_team?.lng,
    },
    city: m.home_team?.city,
    region: m.home_team?.region,
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
/* API functions */
/* ────────────────────────── */

export async function getEventById(eventId: string) {
  const { data, error } = await supabase
    .from("england_pl_football_matches")
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

export async function getUpcomingEvents(limit = 5) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("england_pl_football_matches")
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

export async function getTodaysEvents() {
  const today = new Date();
  const start = today.toISOString().slice(0, 10) + "T00:00:00.000Z";
  const end = today.toISOString().slice(0, 10) + "T23:59:59.999Z";

  const { data, error } = await supabase
    .from("england_pl_football_matches")
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

export async function getEventsWithin7Days() {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("england_pl_football_matches")
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

/* ────────────────────────── */

export async function getAllEvents() {
  const { data, error } = await supabase
    .from("england_pl_football_matches")
    .select(BASE_SELECT)
    .order("date", { ascending: true });

  if (error) {
    console.error("❌ getAllEvents error:", error);
    return [];
  }

  return (data ?? []).map(formatMatch);
}
