//scripts/seed-events.ts

import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function seed() {
  const db = await open({ filename: "sportsive.db", driver: sqlite3.Database });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS "2526_england_pl_football_matches" (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      competition TEXT,
      sport TEXT NOT NULL,
      home_team_id INTEGER NOT NULL,
      away_team_id INTEGER NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS "2526_england_pl_football_teams" (
      id INTEGER PRIMARY KEY,
      name TEXT,
      logo_url TEXT,
      venue TEXT,
      lat REAL,
      lng REAL,
      region TEXT,
      city TEXT
    );
  `);

  // 팀 데이터
  await db.run(`
    INSERT OR REPLACE INTO "2526_england_pl_football_teams"
      (id, name, logo_url, venue, lat, lng, region, city)
    VALUES
      (1, 'Manchester United', 'https://example.com/manu.png', 'Old Trafford', 53.4631, -2.2913, 'Manchester', 'Manchester'),
      (2, 'Liverpool', 'https://example.com/liverpool.png', 'Anfield', 53.4308, -2.9608, 'Liverpool', 'Liverpool');
  `);

  // 경기 데이터
  await db.run(`
    INSERT OR REPLACE INTO "2526_england_pl_football_matches"
      (id, date, status, competition, sport, home_team_id, away_team_id)
    VALUES
      ('537898', '2025-02-08T17:30:00.000Z', 'SCHEDULED', 'Premier League', 'football', 1, 2);
  `);

  console.log("Seed completed!");
}

seed();
