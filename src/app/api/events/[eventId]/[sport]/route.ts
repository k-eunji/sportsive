// src/app/api/events/[eventId]/[sport]/route.ts

import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

function getTableName(region: string, sport: string) {
  const normalizedRegion = region.toLowerCase();
  const normalizedSport = sport.toLowerCase();
  return `2526_${normalizedRegion}_pl_${normalizedSport}_matches`;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ eventId: string; sport: string }> }
) {
  const { eventId, sport } = await context.params;

  const region = eventId;
  const TABLE_MATCHES = getTableName(region, sport);
  const TABLE_TEAMS = TABLE_MATCHES.replace("_matches", "_teams");

  let db: any;

  try {
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    const query = `
      SELECT 
        m.id, m.date, m.status, m.competition, m.sport,
        m.home_team_id, m.away_team_id, m.is_paid,
        ht.name AS homeTeamName, at.name AS awayTeamName,
        ht.logo_url AS homeTeamLogo, at.logo_url AS awayTeamLogo,
        ht.venue AS venue, ht.lat AS lat, ht.lng AS lng,
        ht.region AS region, ht.city AS city, ht.homepage_url AS homepageUrl
      FROM "${TABLE_MATCHES}" m
      JOIN "${TABLE_TEAMS}" ht ON m.home_team_id = ht.id
      JOIN "${TABLE_TEAMS}" at ON m.away_team_id = at.id
      ORDER BY m.date ASC
    `;

    const matches = await db.all(query);

    const cleanName = (name?: string | null) =>
      (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

    const formattedMatches = matches.map((m: any) => ({
      id: String(m.id),
      sport: m.sport || sport,
      date: m.date,
      status: m.status,
      competition: m.competition,
      homeTeam: cleanName(m.homeTeamName),
      awayTeam: cleanName(m.awayTeamName),
      homeTeamLogo: m.homeTeamLogo,
      awayTeamLogo: m.awayTeamLogo,
      city: m.city,
      region: m.region,
      venue: m.venue,
      location: { lat: m.lat, lng: m.lng },
      homepageUrl: m.homepageUrl,
      isPaid: m.is_paid === 1,
      title: `${cleanName(m.homeTeamName)} vs ${cleanName(
        m.awayTeamName
      )}`,
    }));

    return NextResponse.json({ matches: formattedMatches });
  } catch (error) {
    console.error(`❌ Error fetching ${region} ${sport} matches:`, error);
    return NextResponse.json({ matches: [] }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}
