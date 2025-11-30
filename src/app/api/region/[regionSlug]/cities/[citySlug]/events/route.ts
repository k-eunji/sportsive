// src/app/api/region/[regionSlug]/cities/[citySlug]/events/route.ts
import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ regionSlug: string; citySlug: string }> }
) {
  const { regionSlug, citySlug } = await params;
  let db;

  try {
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

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
      WHERE city_slug = ? AND region_slug = ?
      ORDER BY date ASC
      `,
      [citySlug, regionSlug]
    );

    return NextResponse.json({ events });
  } catch (err) {
    console.error("❌ [City Events API Error]:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}
