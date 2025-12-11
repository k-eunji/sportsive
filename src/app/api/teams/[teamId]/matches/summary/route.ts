// src/app/api/teams/[teamId]/matches/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
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

interface RouteParams {
  params: { teamId: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { teamId } = params;

  let db: any;

  try {
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    const today = new Date().toISOString().slice(0, 10);

    // 🔻 오늘 경기
    const todayMatch = await db.get(
      `
      SELECT 
        m.id, m.date, m.competition, m.status,
        m.home_team_id, m.away_team_id,
        ht.name AS homeTeamName,
        at.name AS awayTeamName
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      WHERE (m.home_team_id = ? OR m.away_team_id = ?)
        AND date(m.date) = date(?)
      LIMIT 1
      `,
      [teamId, teamId, today]
    );

    // 🔻 다음 경기
    const nextMatch = await db.get(
      `
      SELECT 
        m.id, m.date, m.competition, m.status,
        m.home_team_id, m.away_team_id,
        ht.name AS homeTeamName,
        at.name AS awayTeamName
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      WHERE (m.home_team_id = ? OR m.away_team_id = ?)
        AND datetime(m.date) > datetime(?)
      ORDER BY m.date ASC
      LIMIT 1
      `,
      [teamId, teamId, today]
    );

    return NextResponse.json({
      todayMatch: todayMatch
        ? {
            ...todayMatch,
            homeTeamName: cleanTeamName(todayMatch.homeTeamName),
            awayTeamName: cleanTeamName(todayMatch.awayTeamName),
          }
        : null,

      nextMatch: nextMatch
        ? {
            ...nextMatch,
            homeTeamName: cleanTeamName(nextMatch.homeTeamName),
            awayTeamName: cleanTeamName(nextMatch.awayTeamName),
          }
        : null,
    });
  } catch (err) {
    console.error("❌ Error fetching match summary:", err);
    return NextResponse.json(
      { todayMatch: null, nextMatch: null, error: "Summary failed" },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}
