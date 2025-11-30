//src/app/api/teams/[teamId]/matches/summary/route.ts

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
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    const todayStr = new Date().toISOString().slice(0, 10);

    // ⬇ 오늘 경기 가져오기
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
      [teamId, teamId, todayStr]
    );

    // ⬇ 다음 경기 (오늘 이후)
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
      [teamId, teamId, todayStr]
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
    console.error("❌ Error fetching summary:", err);
    return NextResponse.json(
      { todayMatch: null, nextMatch: null },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}
