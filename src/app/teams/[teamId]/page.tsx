// src/app/teams/[teamId]/page.tsx
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import TeamHeader from "./components/TeamHeader";
import TeamPageClient from "./TeamPage.client";

import { getTeamById } from "@/lib/teams/getTeamById";
import { getEnglandFootballEvents } from "@/lib/events/getEnglandFootballEvents";

export default async function TeamPage(props: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await props.params;

  // ✅ 팀 정보 (서버에서 직접 Supabase)
  const team = await getTeamById(teamId);
  if (!team) notFound();

  // ✅ 경기 정보 (서버에서 직접 Supabase)
  const matches = await getEnglandFootballEvents();

  const teamIdNum = Number(team.id);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const enrichedMatches = matches.map((m: any) => {
    const isHome = m.homeTeamId === teamIdNum;
    return {
      ...m,
      kickoff: m.date,
      day: m.date.slice(0, 10),
      opponent: isHome ? m.awayTeam : m.homeTeam,
    };
  });

  const todayMatch = enrichedMatches.find(
    (m) =>
      m.day === today &&
      (m.homeTeamId === teamIdNum || m.awayTeamId === teamIdNum)
  );

  const nextMatch = enrichedMatches.find(
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
        nearbyFans={(team as any).nearbyFans}
      />

      <TeamPageClient
        teamId={teamId}
        todayMatch={todayMatch ?? null}
        nextMatch={nextMatch ?? null}
      />
    </>
  );
}
