// src/app/api/teams/[teamId]/momvote/list/route.ts

import { db as fire } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

export const runtime = "nodejs";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

export async function GET(req: Request, ctx: any) {
  const { teamId } = await ctx.params;

  const col = fire.collection("teams").doc(teamId).collection("momvote");
  const snap = await col.orderBy("createdAt", "desc").get();

  if (snap.empty) return NextResponse.json({ list: [] });

  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });

  const list = [];

  for (const doc of snap.docs) {
    const d: any = doc.data();
    const matchId = d.data.matchId;

    // 🔥 SQLite에서 경기 정보 가져오기
    const match = await db.get(
      `
      SELECT 
        m.id,
        m.date,
        m.home_team_id,
        m.away_team_id,
        ht.name AS homeTeam,
        at.name AS awayTeam
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      WHERE m.id = ?
      `,
      [matchId]
    );

    // 🔥 상대팀 계산
    let opponent = "Unknown";
    if (match) {
      opponent =
        match.home_team_id == Number(teamId)
          ? match.awayTeam
          : match.homeTeam;
    }

    // 🔥 후보 정렬
    const sorted = [...(d.data.candidates ?? [])].sort(
      (a, b) => b.votes - a.votes
    );

    list.push({
      id: d.id,
      data: {
        matchId,
        kickoff: match?.date ?? null,
        opponent,
        locked: d.data.locked,
        candidates: sorted,
        winner: sorted[0] ?? null,
      },
    });

  }

  await db.close();

  return NextResponse.json({ list });
}
