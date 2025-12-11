// src/app/api/explore/route.ts

// src/app/api/explore/route.ts

import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

// ✅ Haversine 거리 계산 (km)
function getDistance(lat1: number, lon1: number, lat2?: number, lon2?: number) {
  if (lat2 == null || lon2 == null) return Infinity;

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.toLowerCase() || "";

  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  const lat = latParam ? Number(latParam) : null;
  const lng = lngParam ? Number(lngParam) : null;

  const hasLocation = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  let db;

  try {
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    // ──────────────────────────
    // 1) Latest FanHub Posts
    // ──────────────────────────
    const fanhubPosts = await db.all(`
      SELECT id, text, author_nickname as authorNickname, created_at
      FROM fanhub_posts
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // ──────────────────────────
    // 2) Trending hashtags
    // ──────────────────────────
    const hashtags = await db.all(`
      SELECT hashtag AS tag, COUNT(*) AS count
      FROM fanhub_hashtags
      GROUP BY hashtag
      ORDER BY count DESC
      LIMIT 10
    `);

    // ──────────────────────────
    // 3) Popular Teams
    // ──────────────────────────
    const teams = await db.all(`
      SELECT id, name, city, region, logo_url AS logo
      FROM "2526_england_pl_football_teams"
      ORDER BY RANDOM()
      LIMIT 6
    `);

    // ──────────────────────────
    // 4) Events (존재 안 해도 빌드 안 깨지게)
    // ──────────────────────────
    let rawEvents: any[] = [];

    try {
      rawEvents = await db.all(`
        SELECT id, home_team, away_team, date, venue, city, region, lat, lng
        FROM events
        ORDER BY date ASC
      `);
    } catch {
      rawEvents = [];
    }

    // ──────────────────────────
    // 5) Nearby Events
    // ──────────────────────────
    let nearbyEvents: any[] = [];

    if (hasLocation && lat !== null && lng !== null) {
      nearbyEvents = rawEvents
        .map(e => ({
          ...e,
          distance: getDistance(lat, lng, e.lat, e.lng),
        }))
        .filter(e => e.distance < 80)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 7);
    } else {
      nearbyEvents = rawEvents
        .filter(e => e.city?.toLowerCase() === "london")
        .slice(0, 7);
    }

    // ──────────────────────────
    // 6) Search
    // ──────────────────────────
    let searchResults = null;

    if (q) {
      searchResults = {
        teams: teams.filter(t => t.name.toLowerCase().includes(q)),
        events: rawEvents.filter(
          e =>
            e.home_team?.toLowerCase().includes(q) ||
            e.away_team?.toLowerCase().includes(q)
        ),
        posts: fanhubPosts.filter(p =>
          p.text?.toLowerCase().includes(q)
        ),
      };
    }

    return NextResponse.json({
      nearbyEvents,
      teams,
      fanhubPosts,
      hashtags,
      search: searchResults,
    });
  } catch (err) {
    console.error("❌ Explore API Error:", err);
    return NextResponse.json(
      { error: "Failed to load explore data" },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}
