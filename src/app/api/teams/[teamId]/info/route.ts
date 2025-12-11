// src/app/api/teams/[teamId]/info/route.ts
import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

interface RouteParams {
  params: { teamId: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { teamId } = params;

  let db: any;

  try {
    const idNum = Number(teamId);

    if (isNaN(idNum)) {
      return NextResponse.json({ teamName: null, externalId: null });
    }

    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    const team = await db.get(
      `
      SELECT 
        name,
        id AS externalId
      FROM "2526_england_pl_football_teams"
      WHERE id = ?
      `,
      [idNum]
    );

    if (!team) {
      return NextResponse.json({ teamName: null, externalId: null });
    }

    return NextResponse.json({
      teamName: team.name,
      externalId: team.externalId,
    });
  } catch (err) {
    console.error("❌ Team info error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}
