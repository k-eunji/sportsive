// src/app/teams/[teamId]/page.tsx

import TeamHeader from "./components/TeamHeader";
import TeamPageClient from "./TeamPage.client";

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  const teamData = await fetch(`/api/teams/${teamId}`, {
    cache: "no-store",
  }).then((r) => r.json());


  const team = teamData.team;

  const events = await fetch(`/api/events/england/football`, {
    cache: "no-store",
  }).then((r) => r.json());

  const matches = (events.matches as any[]).map((m: any) => {
    const isHome = m.homeTeamId === team.id;

    return {
      ...m,
      kickoff: m.date,
      day: m.date.slice(0, 10),
      opponent: isHome ? m.awayTeam : m.homeTeam,   // ⭐ 추가
    };
  });

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const todayMatch = matches.find(
    (m: any) =>
      m.day === today &&
      (m.homeTeamId === team.id || m.awayTeamId === team.id)
  );

  const nextMatch = matches.find(
    (m: any) =>
      new Date(m.date).getTime() > now.getTime() &&
      (m.homeTeamId === team.id || m.awayTeamId === team.id)
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
