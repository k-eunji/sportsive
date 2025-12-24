// src/app/teams/[teamId]/page.tsx

export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import TeamHeader from "./components/TeamHeader";
import TeamPageClient from "./TeamPage.client";

export default async function TeamPage(props: {
  params: Promise<{ teamId: string }>;
}) {
  // ✅ Next 16 규칙
  const { teamId } = await props.params;

  // ✅ Next 15/16: headers()는 async
  const h = await headers();
  const host = h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Missing host header");
  }

  const baseUrl = `${protocol}://${host}`;

  // ----------------------------
  // 팀 정보
  // ----------------------------
  const teamRes = await fetch(
    `${baseUrl}/api/teams/${teamId}`,
    { cache: "no-store" }
  );
  const teamData = await teamRes.json();
  const team = teamData.team;

  // ----------------------------
  // 경기 정보
  // ----------------------------
  const eventsRes = await fetch(
    `${baseUrl}/api/events/england/football`,
    { cache: "no-store" }
  );
  const events = await eventsRes.json();

  const teamIdNum = Number(team.id);

  const matches = (events.matches as any[]).map((m: any) => {
    const isHome = m.homeTeamId === teamIdNum;
    return {
      ...m,
      kickoff: m.date,
      day: m.date.slice(0, 10),
      opponent: isHome ? m.awayTeam : m.homeTeam,
    };
  });

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const todayMatch = matches.find(
    (m) =>
      m.day === today &&
      (m.homeTeamId === teamIdNum || m.awayTeamId === teamIdNum)
  );

  const nextMatch = matches.find(
    (m) =>
      new Date(m.date).getTime() > now.getTime() &&
      (m.homeTeamId === teamIdNum || m.awayTeamId === teamIdNum)
  );

  return (
    <>
      <TeamHeader
        team={team}
        teamId={teamId}
        nextMatch={nextMatch}
        nearbyFans={team.nearbyFans}
      />

      <TeamPageClient
        teamId={teamId}
        todayMatch={todayMatch ?? null}
        nextMatch={nextMatch ?? null}
      />
    </>
  );
}
