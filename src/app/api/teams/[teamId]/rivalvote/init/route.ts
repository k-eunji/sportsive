//src/app/api/teams/[teamId]/rivalvote/init/route.ts

import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { db } from "@/lib/firebaseAdmin";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

export async function POST(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params;

    // SQLite 연결
    const sqlite = await open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    });

    // 리그 팀 전체 가져오기
    const teams = await sqlite.all(`
      SELECT id, name, logo_url AS logo 
      FROM "2526_england_pl_football_teams"
    `);

    await sqlite.close();

    // 자기 팀 제외
    const options = teams
      .filter((t) => t.id !== Number(teamId))
      .map((t) => ({
        teamId: t.id,
        teamName: t.name,
        logo: t.logo,
        votes: 0,
      }));

    const ref = db
      .collection("teams")
      .doc(teamId)
      .collection("rivalvote")
      .doc("module");

    await ref.set({
      options,
      participants: 0,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, optionsCount: options.length });
  } catch (err) {
    console.error("RivalVote INIT error:", err);
    return NextResponse.json(
      { error: "Failed to initialize rivalvote" },
      { status: 500 }
    );
  }
}
