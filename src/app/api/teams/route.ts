// src/app/api/teams/route.ts

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

export async function GET() {
  let db;
  try {
    db = await open({ filename: DB_FILE, driver: sqlite3.Database });

    // ✔ 팀만 가져오고 → 경기 정보는 서브쿼리로 가져온다 (중복 NO)
    const teams = await db.all(`
      SELECT
        t.id,
        t.name,
        t.logo_url AS logo,
        t.region,
        t.city,
        t.homepage_url AS homepageUrl,
        t.venue,
        t.transport_info AS transportInfo,

        -- 경기에서 competition 하나만 가져오기
        (
          SELECT m.competition
          FROM "2526_england_pl_football_matches" m
          WHERE m.home_team_id = t.id OR m.away_team_id = t.id
          LIMIT 1
        ) AS competition,

        (
          SELECT m.sport
          FROM "2526_england_pl_football_matches" m
          WHERE m.home_team_id = t.id OR m.away_team_id = t.id
          LIMIT 1
        ) AS sport

      FROM "2526_england_pl_football_teams" t
      ORDER BY t.name ASC
    `);

    const formattedTeams = teams.map((t: any) => ({
      ...t,
      id: String(t.id),
      name: cleanTeamName(t.name),
      competition: t.competition || "Unknown",
      sport: t.sport || "Football",
    }));

    const englandTeam = {
      id: "england",
      name: "England National Football Team",
      logo: "https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg",
      region: "United Kingdom",
      city: "London",
      homepageUrl: "https://www.englandfootball.com/",
      venue: "Wembley Stadium",
      transportInfo: "Wembley Park Station (Jubilee & Metropolitan Lines)",
      competition: "International Matches",
      sport: "Football",
    };

    // DB에서 잉글랜드 같은 이름 가진 팀 제거
    const filteredTeams = formattedTeams.filter(
      (t: any) => t.name.toLowerCase() !== "england"
    );

    return NextResponse.json({
      teams: [englandTeam, ...filteredTeams],
    });

  } catch (err) {
    console.error("❌ Error fetching teams:", err);
    return NextResponse.json({ teams: [] }, { status: 500 });
  }
}
