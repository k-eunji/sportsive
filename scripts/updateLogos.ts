// scripts/updateLogos.ts

import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { teamLogoMapById } from "../src/data/teamLogos.ts";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

async function updateTeamLogos() {
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  console.log("🔄 Updating team logos in SQLite...");

  for (const [id, logo] of Object.entries(teamLogoMapById)) {

    await db.run(
      `UPDATE "2526_england_pl_football_teams" SET logo_url = ? WHERE id = ?`,
      [logo, Number(id)]
    );

    console.log(`✓ Updated #${id} → ${logo}`);
  }

  await db.close();
  console.log("🔥 All logos updated successfully!");
}

updateTeamLogos().catch(console.error);
