// src/lib/events.ts
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

export async function getEventById(eventId: string) {
  let db;
  try {
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    const m = await db.get(
      `
      SELECT 
        m.id, m.date, m.status, m.competition, m.sport,
        ht.name AS homeTeamName,
        at.name AS awayTeamName,
        ht.logo_url AS homeTeamLogo,
        at.logo_url AS awayTeamLogo,
        ht.venue AS venue,
        ht.lat AS lat,
        ht.lng AS lng,
        ht.region AS region,
        ht.city AS city
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      WHERE m.id = ?
    `,
      [eventId]
    );

    if (!m) return null;

    const cleanTeamName = (name: string | null | undefined) =>
      (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

    return {
      id: m.id.toString(),
      date: m.date,
      sport: (m.sport || "football").toLowerCase(),
      status: m.status,
      competition: m.competition,
      homeTeam: cleanTeamName(m.homeTeamName),
      awayTeam: cleanTeamName(m.awayTeamName),
      homeTeamLogo: m.homeTeamLogo,
      awayTeamLogo: m.awayTeamLogo,
      venue: m.venue,
      location: { lat: m.lat, lng: m.lng },
      city: m.city,
      region: m.region,
    };
  } finally {
    if (db) await db.close();
  }
}

export async function getUpcomingEvents(limit = 5) {
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });
  try {
    const rows = await db.all(
      `
      SELECT m.id, m.date, m.sport, ht.name AS homeTeamName, at.name AS awayTeamName,
             ht.logo_url AS homeTeamLogo, at.logo_url AS awayTeamLogo,
             ht.venue AS venue, ht.lat AS lat, ht.lng AS lng,
             ht.region AS region, ht.city AS city
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      WHERE datetime(m.date) >= datetime('now')
      ORDER BY m.date ASC
      LIMIT ?
      `,
      [limit]
    );

    const cleanTeamName = (name: string | null | undefined) =>
      (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

    return rows.map((m) => ({
      id: m.id.toString(),
      date: m.date,
      sport: (m.sport || "football").toLowerCase(),
      homeTeam: cleanTeamName(m.homeTeamName),
      awayTeam: cleanTeamName(m.awayTeamName),
      homeTeamLogo: m.homeTeamLogo,
      awayTeamLogo: m.awayTeamLogo,
      venue: m.venue,
      location: { lat: m.lat, lng: m.lng },
      city: m.city,
      region: m.region,
      competition: m.competition ?? "",
    }));
  } finally {
    await db.close();
  }
}

// src/lib/events.ts
export async function getTodaysEvents() {
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });
  try {
    const today = new Date();
    const startOfDay = today.toISOString().slice(0, 10) + "T00:00:00.000Z";
    const endOfDay = today.toISOString().slice(0, 10) + "T23:59:59.999Z";

    const rows = await db.all(
      `
      SELECT m.id, m.date, m.sport, ht.name AS homeTeamName, at.name AS awayTeamName,
             ht.logo_url AS homeTeamLogo, at.logo_url AS awayTeamLogo,
             ht.venue AS venue, ht.lat AS lat, ht.lng AS lng,
             ht.region AS region, ht.city AS city
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      WHERE datetime(m.date) BETWEEN datetime(?) AND datetime(?)
      ORDER BY m.date ASC
      `,
      [startOfDay, endOfDay]
    );

    const cleanTeamName = (name: string | null | undefined) =>
      (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

    return rows.map((m) => ({
      id: m.id.toString(),
      date: m.date,
      sport: (m.sport || "football").toLowerCase(),
      homeTeam: cleanTeamName(m.homeTeamName),
      awayTeam: cleanTeamName(m.awayTeamName),
      homeTeamLogo: m.homeTeamLogo,
      awayTeamLogo: m.awayTeamLogo,
      venue: m.venue,
      location: { lat: m.lat, lng: m.lng },
      city: m.city,
      region: m.region,
    }));
  } finally {
    await db.close();
  }
}

export async function getEventsWithin7Days() {
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const rows = await db.all(
      `
      SELECT m.id, m.date, m.sport, ht.name AS homeTeamName, at.name AS awayTeamName,
             ht.logo_url AS homeTeamLogo, at.logo_url AS awayTeamLogo,
             ht.venue AS venue, ht.lat AS lat, ht.lng AS lng,
             ht.region AS region, ht.city AS city
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      WHERE datetime(m.date) BETWEEN datetime(?) AND datetime(?)
      ORDER BY m.date ASC
      `,
      [now.toISOString(), sevenDaysLater.toISOString()]
    );

    const cleanTeamName = (name: string | null | undefined) =>
      (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

    return rows.map((m) => ({
      id: m.id.toString(),
      date: m.date,
      sport: (m.sport || "football").toLowerCase(),
      homeTeam: cleanTeamName(m.homeTeamName),
      awayTeam: cleanTeamName(m.awayTeamName),
      homeTeamLogo: m.homeTeamLogo,
      awayTeamLogo: m.awayTeamLogo,
      venue: m.venue,
      location: { lat: m.lat, lng: m.lng },
      city: m.city,
      region: m.region,
    }));
  } finally {
    await db.close();
  }
}

export async function getAllEvents() {
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });
  try {
    const rows = await db.all(
      `
      SELECT 
        m.id, m.date,
        m.sport,                              -- ⭐⭐⭐ 반드시 포함!
        ht.name AS homeTeamName, 
        at.name AS awayTeamName,
        ht.logo_url AS homeTeamLogo, 
        at.logo_url AS awayTeamLogo,
        ht.venue AS venue, 
        ht.lat AS lat, 
        ht.lng AS lng,
        ht.region AS region, 
        ht.city AS city
      FROM "2526_england_pl_football_matches" m
      JOIN "2526_england_pl_football_teams" ht ON m.home_team_id = ht.id
      JOIN "2526_england_pl_football_teams" at ON m.away_team_id = at.id
      ORDER BY datetime(m.date) ASC
      `
    );

    const cleanTeamName = (name: string | null | undefined) =>
      (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

    return rows.map((m) => ({
      id: m.id.toString(),
      date: m.date,
      sport: (m.sport || "football").toLowerCase(),   // ⭐⭐⭐ 반드시 존재!
      homeTeam: cleanTeamName(m.homeTeamName),
      awayTeam: cleanTeamName(m.awayTeamName),
      homeTeamLogo: m.homeTeamLogo,
      awayTeamLogo: m.awayTeamLogo,
      venue: m.venue,
      location: { lat: m.lat, lng: m.lng },
      city: m.city,
      region: m.region,
    }));
  } finally {
    await db.close();
  }
}
