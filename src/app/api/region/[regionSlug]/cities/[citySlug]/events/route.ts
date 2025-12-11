// src/app/api/region/[regionSlug]/cities/[citySlug]/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

interface RouteParams {
  params: { regionSlug: string; citySlug: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { regionSlug, citySlug } = params;
  let db: any;

  try {
    db = await open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    });

    const events = await db.all(
      `
      SELECT 
        id,
        home_team,
        away_team,
        date,
        venue,
        is_free
      FROM events
      WHERE region_slug = ? AND city_slug = ?
      ORDERORDER BY date ASC
      `,
      [regionSlug, citySlug]
    );

    return NextResponse.json({ events });
  } catch (err) {
    console.error("❌ [City Events API Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}
