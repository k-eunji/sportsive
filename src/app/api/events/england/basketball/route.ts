// src/app/api/events/england/basketball/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseServer";

// 농구는 클린 ID 필요 없음 → 표시용 최소 정리만
const displayTeamName = (name?: string | null) =>
  (name ?? "").trim();

export async function GET() {
  try {
    const { data: matches, error } = await supabase
      .from("basketball_matches")
      .select(`
        id,
        date,
        status,
        competition,
        kind,
        is_paid,
        home_team_id,
        away_team_id,

        home_team:home_team_id (
          id,
          name,
          logo_url,
          venue,
          lat,
          lng,
          region,
          city
        ),

        away_team:away_team_id (
          id,
          name,
          logo_url
        )
      `)
      .order("date", { ascending: true });

    if (error || !matches) {
      console.error("❌ basketball query error:", error);
      return NextResponse.json({ events: [] });
    }

    const events = matches.map((m: any) => {
      const homeName = displayTeamName(m.home_team?.name);
      const awayName = displayTeamName(m.away_team?.name);

      return {
        id: String(m.id),

        // 🔹 Sportsive core
        sport: "basketball",
        kind: m.kind ?? "match",
        date: m.date,
        status: m.status,

        // 🔹 optional metadata (UI에 안 보여도 됨)
        competition: m.competition ?? null,
        isPaid: m.is_paid,

        // 🔹 teams
        homeTeamId: m.home_team_id,
        awayTeamId: m.away_team_id,

        homeTeam: homeName,
        awayTeam: awayName,
        homeTeamLogo: m.home_team?.logo_url ?? null,
        awayTeamLogo: m.away_team?.logo_url ?? null,

        // 🔹 location (Sportsive 핵심)
        venue: m.home_team?.venue ?? null,
        city: m.home_team?.city ?? null,
        region: m.home_team?.region ?? null,
        location: m.home_team?.lat && m.home_team?.lng
          ? {
              lat: m.home_team.lat,
              lng: m.home_team.lng,
            }
          : null,

        // 🔹 display helpers
        title: `${homeName} vs ${awayName}`,
      };
    });

    return NextResponse.json({ events });
  } catch (err) {
    console.error("❌ basketball events error:", err);
    return NextResponse.json({ events: [] });
  }
}
