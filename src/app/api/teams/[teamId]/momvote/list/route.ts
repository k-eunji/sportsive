// src/app/api/teams/[teamId]/momvote/list/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  // 🔥 Firestore (Admin SDK)
  const colRef = adminDb
    .collection("teams")
    .doc(teamId)
    .collection("momvote");

  const snap = await colRef.orderBy("createdAt", "desc").get();

  if (snap.empty) {
    return NextResponse.json({ list: [] });
  }

  // 🔥 SQLite 연결
  const sqliteDb = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  const list: any[] = [];

  for (const doc of snap.docs) {
    const d: any = doc.data();
    const matchId = d.data.matchId;

    // 🔥 SQLite에서 경기 정보 조회
    const match = await sqliteDb.get(
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
        match.home_team_id === Number(teamId)
          ? match.awayTeam
          : match.homeTeam;
    }

    // 🔥 후보 정렬 (득표수 기준)
    const candidates = Array.isArray(d.data.candidates)
      ? [...d.data.candidates].sort((a, b) => b.votes - a.votes)
      : [];

    list.push({
      id: doc.id,
      data: {
        matchId,
        kickoff: match?.date ?? null,
        opponent,
        locked: d.data.locked ?? false,
        candidates,
        winner: candidates[0] ?? null,
      },
    });
  }

  await sqliteDb.close();

  return NextResponse.json({ list });
}
