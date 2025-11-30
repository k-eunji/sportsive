//src/lib/teams.ts

import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

export async function GetTeamById(teamId: string) {
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });
  try {
    const team = await db.get(
      `
      SELECT id, name, logo_url AS logo, country, sport, description, homepage_url AS homepageUrl
      FROM "2526_england_pl_football_teams"
      WHERE id = ?
      `,
      [teamId]
    );
    return team ?? null;
  } finally {
    await db.close();
  }
}
