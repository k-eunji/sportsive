// src/app/api/teams/[teamId]/matches/route.ts

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

  let db;

  try {
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    });

    // ⚽ 과거 경기 1개 (가장 최근 경기)
    const pastMatches = await db.all(
      `
      SELECT 
        m.id, m.date, m.status, m.competition,
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
      JOIN "2526_england_pl_football_teams" ht 
        ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at 
        ON m.away_team_id = at.id
      WHERE (m.home_team_id = ? OR m.away_team_id = ?)
        AND datetime(m.date) < datetime('now')
      ORDER BY datetime(m.date) DESC
      LIMIT 4
      `,
      [teamId, teamId]
    );

    // ⚽ 업커밍 5경기
    const upcomingMatches = await db.all(
      `
      SELECT 
        m.id, m.date, m.status, m.competition,
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
      JOIN "2526_england_pl_football_teams" ht 
        ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at 
        ON m.away_team_id = at.id
      WHERE (m.home_team_id = ? OR m.away_team_id = ?)
        AND datetime(m.date) >= datetime('now')
      ORDER BY datetime(m.date) ASC
      LIMIT 5
      `,
      [teamId, teamId]
    );

    // 🔥 past[0]은 DESC로 가져왔으니 자동적으로 "가장 최근 경기"
    // 🔥 upcoming은 ASC → nextMatch가 upcoming[0]

    const final = [...pastMatches, ...upcomingMatches];

    const formatted = final.map((m: any) => ({
      id: m.id.toString(),
      date: m.date,
      status: m.status,
      competition: m.competition,
      homeTeam: cleanTeamName(m.homeTeamName),
      awayTeam: cleanTeamName(m.awayTeamName),
      homeTeamLogo: m.homeTeamLogo,
      awayTeamLogo: m.awayTeamLogo,
      venue: m.venue,
      city: m.city,
      region: m.region,
      location: { lat: m.lat, lng: m.lng },
      homepageUrl: m.homepageUrl,
      title: `${cleanTeamName(m.homeTeamName)} vs ${cleanTeamName(
        m.awayTeamName
      )}`,
    }));

    return NextResponse.json({ matches: formatted });
  } catch (err) {
    console.error("❌ Error fetching matches:", err);
    return NextResponse.json({ matches: [] }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}
