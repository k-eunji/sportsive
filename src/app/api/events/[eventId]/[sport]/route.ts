// src/app/api/events/[eventId]/[sport]/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseServer";
import { getEventById } from "@/lib/events";
import { isEventActiveInWindow } from "@/lib/events/lifecycle";

const cleanTeamName = (name?: string | null) =>
  (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

export async function GET(
  _req: Request,
  context: { params: Promise<{ eventId: string; sport: string }> }
) {
  const { eventId } = await context.params;

  try {
    // 1️⃣ 기준 이벤트
    const baseEvent = await getEventById(eventId);
    if (!baseEvent) {
      return NextResponse.json({ matches: [] });
    }

    // 2️⃣ 팀 스포츠 (기존 로직 유지)
    if (baseEvent.kind === "match") {
      const table =
        baseEvent.sport === "rugby"
          ? "england_rugby_matches"
          : "england_pl_football_matches";

      const { data, error } = await supabase
        .from(table)
        .select(`
          id,
          date,
          status,
          competition,
          sport,
          is_paid,
          home_team_id,
          away_team_id,
          home_team:home_team_id (
            id, name, logo_url, venue, lat, lng, region, city, homepage_url
          ),
          away_team:away_team_id (
            id, name, logo_url
          )
        `)
        .eq("region", baseEvent.region)
        .order("date", { ascending: true });

      if (error || !data) return NextResponse.json({ matches: [] });

      return NextResponse.json({
        matches: data.map((m: any) => ({
          id: String(m.id),
          kind: "match",
          sport: baseEvent.sport,
          date: m.date,
          status: m.status,
          competition: m.competition,
          homeTeam: cleanTeamName(m.home_team?.name),
          awayTeam: cleanTeamName(m.away_team?.name),
          homeTeamLogo: m.home_team?.logo_url,
          awayTeamLogo: m.away_team?.logo_url,
          venue: m.home_team?.venue,
          location: { lat: m.home_team?.lat, lng: m.home_team?.lng },
          city: m.home_team?.city,
          region: m.home_team?.region,
          isPaid: m.is_paid === 1,
          title: `${cleanTeamName(m.home_team?.name)} vs ${cleanTeamName(
            m.away_team?.name
          )}`,
        })),
      });
    }

    // 3️⃣ session / round (테니스, F1, 경마)
    const { data } = await supabase
      .from("events") // 👉 나중에 통합 뷰
      .select("*")
      .eq("venue", baseEvent.venue);

    const now = new Date();
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + 14);

    const related = (data ?? []).filter((e: any) =>
      isEventActiveInWindow(e, now, windowEnd)
    );

    return NextResponse.json({ matches: related });
  } catch (err) {
    console.error("❌ related events error:", err);
    return NextResponse.json({ matches: [] }, { status: 500 });
  }
}
