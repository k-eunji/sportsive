// src/app/api/events/england/cricket/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseServer";

const englandNationalMatches = [
  {
    id: "eng-t20-sco-20260214",
    sport: "cricket",
    kind: "t20",
    date: "2026-02-10T09:30:00",
    status: "scheduled",
    competition: "ICC Men's T20 World Cup",

    homeTeamId: "england-men",
    awayTeamId: "scotland-men",

    homeTeam: "England Men",
    awayTeam: "Scotland Men",
    homeTeamLogo: null,
    awayTeamLogo: null,

    venue: "Eden Gardens",
    city: "Kolkata",
    homepageUrl: "https://www.ecb.co.uk/england/men/fixtures?_gl=1*19amex2*_up*MQ..*_ga*MTAxNjEwODc3OS4xNzcwODAyOTM1*_ga_E3D3L0MGDX*czE3NzA4MTk0NjQkbzIkZzAkdDE3NzA4MTk0NjQkajYwJGwwJGgw*_ga_RB2BVD5EKH*czE3NzA4MTk0NjQkbzIkZzAkdDE3NzA4MTk0NjQkajYwJGwwJGgw",
    isPaid: true,

    location: { lat: 51.556663281575105, lng: -0.27953205701577144 },

    title: "England Men vs Scotland Men",
  },
];

// 농구는 클린 ID 필요 없음 → 표시용 최소 정리만
const displayTeamName = (name?: string | null) =>
  (name ?? "").trim();

export async function GET() {
  try {
    const { data: matches, error } = await supabase
      .from("cricket_matches")
      .select(`
        id,
        date,
        status,
        competition,
        kind,
        home_team_id,
        away_team_id,
        is_paid,

        home_team:home_team_id (
          id,
          name,
          logo_url,
          venue,
          lat,
          lng,
          region,
          city,
          homepage_url
        ),

        away_team:away_team_id (
          id,
          name,
          logo_url
        )
      `)
      .order("date", { ascending: true });

    if (error || !matches) {
      console.error("❌ cricket query error:", error);
      return NextResponse.json({ events: [] });
    }

    const events = matches.map((m: any) => {
      const homeName = displayTeamName(m.home_team?.name);
      const awayName = displayTeamName(m.away_team?.name);

      return {
        id: String(m.id),

        // 🔹 Sportsive core
        sport: "cricket",
        kind: m.kind ?? "match",
        date: m.date,
        status: m.status,

        // 🔹 optional metadata (UI에 안 보여도 됨)
        competition: m.competition ?? null,

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
        homepageUrl: m.home_team?.homepage_url,
        isPaid: m.is_paid === true,  

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
    
    const mergedEvents = [...events, ...englandNationalMatches];

    return NextResponse.json({ events: mergedEvents });
  } catch (err) {
    console.error("❌ cricket events error:", err);
    return NextResponse.json({ events: [] });
  }
}
