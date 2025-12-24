// src/app/teams/[teamId]/page.tsx

export const dynamic = "force-dynamic";

import TeamHeader from "./components/TeamHeader";
import TeamPageClient from "./TeamPage.client";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export default async function TeamPage(props: {
  params: Promise<{ teamId: string }>;
}) {
  // ✅ Next 16 규칙: params는 Promise
  const { teamId } = await props.params;

  // ----------------------------
  // 팀 정보
  // ----------------------------
  const teamData = await fetch(
    `/api/teams/${teamId}`,
    { cache: "no-store" }
  ).then((r) => r.json());

  const team = teamData.team;

  // ----------------------------
  // 경기 정보
  // ----------------------------
  const events = await fetch(
    `/api/events/england/football`,
    { cache: "no-store" }
  ).then((r) => r.json());

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
    (m: any) =>
      m.day === today &&
      (m.homeTeamId === teamIdNum || m.awayTeamId === teamIdNum)
  );

  const nextMatch = matches.find(
    (m: any) =>
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
