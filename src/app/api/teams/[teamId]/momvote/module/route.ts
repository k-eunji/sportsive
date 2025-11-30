// src/app/api/teams/[teamId]/momvote/module/route.ts

export const runtime = "nodejs";

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

export async function GET(req: Request, ctx: any) {
  const { teamId } = await ctx.params;

  // SQLite에서 오늘 경기 찾기 (summary API 의존 X)
  const dbSql = await open({ filename: DB_FILE, driver: sqlite3.Database });

  const match = await dbSql.get(
    `
      SELECT 
        m.id, 
        m.date,
        m.home_team_id,
        m.away_team_id,
        ht.name as homeTeam,
        at.name as awayTeam
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      WHERE m.date BETWEEN datetime('now', 'start of day', 'localtime')
                 AND datetime('now', 'start of day', '+1 day', 'localtime')
      AND (m.home_team_id = ? OR m.away_team_id = ?)

    `,
    [teamId, teamId]
  );

  await dbSql.close();

  if (!match)
    return NextResponse.json({ module: null }); // 오늘 경기 없음

  const opponent =
    match.home_team_id == Number(teamId)
      ? match.awayTeam
      : match.homeTeam;

  const kickoff = match.date;

  // Firestore reference
  const col = db
    .collection("teams")
    .doc(teamId)
    .collection("momvote");

  // 이미 있는지 확인
  const snap = await col.where("data.matchId", "==", match.id).get();

  if (!snap.empty) {
    return NextResponse.json({ module: snap.docs[0].data() });
  }

  // 새 문서 생성
  const ref = col.doc();
  const newModule = {
    id: ref.id,
    createdAt: new Date().toISOString(),
    reactions: { likes: 0, participants: 0 },
    data: {
      matchId: match.id,
      title: "Man of the Match",
      expiresAt: new Date(new Date(kickoff).getTime() + 24 * 60 * 60 * 1000)
        .toISOString(),
      locked: false,
      kickoff,
      opponent,
      candidates: [],
    },
  };

  await ref.set(newModule);

  return NextResponse.json({ module: newModule });
}
