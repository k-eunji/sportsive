// src/app/api/teams/[teamId]/route.ts
import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

function cleanTeamName(name: string | null | undefined) {
  return (name ?? "")
    .replace(/\b(FC|AFC|CF)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  // ✅ 1️⃣ England National Team — Special Case
  if (teamId.toLowerCase() === "england") {
    return NextResponse.json({
      team: {
        id: "england",
        name: "England National Football Team",
        logo: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
        region: "United Kingdom",
        city: "London",
        homepageUrl: "https://www.englandfootball.com/",
        venue: "Wembley Stadium",
        transportInfo: "Wembley Park Station (Jubilee & Metropolitan Lines)",
        foundedYear: 1863,
        instagram: "https://www.instagram.com/england",
        x: "https://x.com/England",
        youtube: "https://www.youtube.com/@EnglandFootball",
      },
    });
  }

  // ✅ 2️⃣ 나머지 팀은 DB 조회
  const teamIdNum = Number(teamId);
  if (isNaN(teamIdNum)) {
    return NextResponse.json({ team: null }, { status: 400 });
  }

  let db;
  try {
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    const team = await db.get(
      `
      SELECT 
        id,
        name,
        logo_url AS logo,
        region,
        city,
        homepage_url AS homepageUrl,
        venue,
        transport_info AS transportInfo,
        founded_year AS foundedYear,
        instagram,
        x,
        youtube
      FROM "2526_england_pl_football_teams"
      WHERE id = ?
      `,
      [teamIdNum]
    );

    if (!team) {
      return NextResponse.json({ team: null }, { status: 404 });
    }

    return NextResponse.json({
      team: {
        ...team,
        name: cleanTeamName(team.name),
      },
    });
  } catch (err) {
    console.error("❌ Error fetching team:", err);
    return NextResponse.json({ team: null }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}
