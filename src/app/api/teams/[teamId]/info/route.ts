// src/app/api/teams/[teamId]/info/route.ts

import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

export async function GET(req: Request, context: any) {
  try {
    const { teamId } = await context.params;

    const idNum = Number(teamId);
    if (isNaN(idNum)) {
      return NextResponse.json({ teamName: null, externalId: null });
    }

    const db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    const team = await db.get(
      `SELECT name, id AS externalId
       FROM "2526_england_pl_football_teams"
       WHERE id = ?`,
      [idNum]
    );

    await db.close();

    if (!team) {
      return NextResponse.json({ teamName: null, externalId: null });
    }

    return NextResponse.json({
      teamName: team.name,
      externalId: team.externalId,
    });

  } catch (e) {
    console.error("team info error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
