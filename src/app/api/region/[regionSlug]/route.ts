// src/app/api/region/[regionSlug]/route.ts
import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ regionSlug: string }> }
) {
  const { regionSlug } = await params;
  let db;

  try {
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    const region = await db.get(
      `
      SELECT 
        id,
        name,
        country_code AS countryCode,
        continent,
        slug
      FROM regions
      WHERE slug = ?
      `,
      [regionSlug]
    );

    if (!region) {
      return NextResponse.json({ region: null }, { status: 404 });
    }

    // 관련 도시 목록도 함께 반환
    const cities = await db.all(
      `
      SELECT 
        id,
        name,
        slug,
        population
      FROM cities
      WHERE region_id = ?
      `,
      [region.id]
    );

    return NextResponse.json({ ...region, cities });
  } catch (err) {
    console.error("❌ [Region API Error]:", err);
    return NextResponse.json({ error: "Failed to fetch region" }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}
