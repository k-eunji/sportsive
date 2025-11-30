// src/app/api/events/england/football/route.ts
import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

export async function GET() {
  let db;
  try {
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    });

    const matches = await db.all(`
      SELECT 
        m.id, m.date, m.status, m.competition, m.sport,   -- ✅ sport 추가
        m.home_team_id, m.away_team_id, m.is_paid,
        ht.name AS homeTeamName,
        at.name AS awayTeamName,
        ht.logo_url AS homeTeamLogo,
        at.logo_url AS awayTeamLogo,
        ht.venue AS venue,
        ht.lat AS lat,
        ht.lng AS lng,
        ht.region AS region,
        ht.city AS city,
        ht.homepage_url AS homepageUrl
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      ORDER BY m.date ASC
    `);

    const cleanTeamName = (name?: string | null) =>
      (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

    const formattedMatches = matches.map((m: any) => ({
      id: m.id.toString(),
      date: m.date,
      status: m.status,
      competition: m.competition,
      sport: (m.sport || "football").toLowerCase(),

      // ⭐ 여 two 줄 추가
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,

      homeTeam: cleanTeamName(m.homeTeamName),
      awayTeam: cleanTeamName(m.awayTeamName),
      homeTeamLogo: m.homeTeamLogo,
      awayTeamLogo: m.awayTeamLogo,
      venue: m.venue,
      location: { lat: m.lat, lng: m.lng },
      city: m.city,
      region: m.region,
      isPaid: m.is_paid === 1,
      homepageUrl: m.homepageUrl,
      teams: [cleanTeamName(m.homeTeamName), cleanTeamName(m.awayTeamName)],
      title: `${cleanTeamName(m.homeTeamName)} vs ${cleanTeamName(m.awayTeamName)}`,
    }));

    return NextResponse.json({ matches: formattedMatches });
  } catch (error) {
    console.error("❌ Error fetching football matches:", error);
    return NextResponse.json({ matches: [] }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}
