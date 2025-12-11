// src/app/api/region/[regionSlug]/cities/[citySlug]/community/route.ts
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

    const posts = await db.all(
      `
      SELECT 
        id,
        user,
        text,
        likes,
        created_at
      FROM community_posts
      WHERE region_slug = ? AND city_slug = ?
      ORDER BY created_at DESC
      LIMIT 20
      `,
      [regionSlug, citySlug]
    );

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("❌ [Community API Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch community posts" },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}
