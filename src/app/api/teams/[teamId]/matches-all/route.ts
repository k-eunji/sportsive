//api/teams/[teamId]/matches-all/route.ts

import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

function cleanTeamName(name: string | null | undefined) {
  return (name ?? "")
    .replace(/\b(FC|AFC|CF)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });

  try {
    const matches = await db.all(
      `
      SELECT 
        m.id, m.date, m.status, m.competition,
        ht.name AS homeTeamName,
        at.name AS awayTeamName,
        ht.logo_url AS homeTeamLogo,
        at.logo_url AS awayTeamLogo,
        ht.venue AS venue,
        ht.region AS region,
        ht.city AS city
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      WHERE m.home_team_id = ? OR m.away_team_id = ?
      ORDER BY datetime(m.date) ASC
      `,
      [teamId, teamId]
    );

    return NextResponse.json({
      matches: matches.map((m: any) => ({
        id: m.id.toString(),
        date: m.date,
        status: m.status,
        competition: m.competition,
        homeTeam: cleanTeamName(m.homeTeamName),
        awayTeam: cleanTeamName(m.awayTeamName),
        homeTeamLogo: m.homeTeamLogo,
        awayTeamLogo: m.awayTeamLogo,
        venue: m.venue,
        region: m.region,
        city: m.city
      }))
    });
  } finally {
    await db.close();
  }
}
