// fixTeams.js

import { db } from "./src/lib/firebaseAdmin.ts";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function run() {
  const sqlite = await open({
    filename: "./sportsive.db",
    driver: sqlite3.Database,
  });

  const teams = await sqlite.all(`
    SELECT id, name, logo_url AS logo, region, city, homepage_url AS homepageUrl
    FROM "2526_england_pl_football_teams"
  `);

  console.log(`Found ${teams.length} teams in SQLite.`);

  for (const t of teams) {
    const doc = {
      name: t.name,
      logo: t.logo,
      region: t.region,
      city: t.city,
      homepageUrl: t.homepageUrl,
      externalId: t.id,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("teams").doc(String(t.id)).set(doc, { merge: true });
    console.log(`Updated Firestore doc: teams/${t.id}`);
  }

  console.log("Done!");
  await sqlite.close();
}

run().catch(console.error);
