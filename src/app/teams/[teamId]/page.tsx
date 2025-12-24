// src/app/teams/[teamId]/page.tsx
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import TeamHeader from "./components/TeamHeader";
import TeamPageClient from "./TeamPage.client";
import { getTeamById } from "@/lib/teams/getTeamById";

async function getJsonOrThrow(res: Response) {
  // HTML이 오면 여기서 바로 잡아냄
  const text = await res.text();
  if (!res.ok) {
    console.error("API failed:", res.status, text.slice(0, 200));
    throw new Error(`API failed: ${res.status}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    console.error("Non-JSON response (first 200 chars):", text.slice(0, 200));
    throw new Error("Response was not JSON");
  }
}

export default async function TeamPage(props: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await props.params;

  // ✅ 팀 정보: 내부 API 호출 X, 서버에서 바로 Supabase 호출
  const team = await getTeamById(teamId);
  if (!team) notFound();

  // ✅ 경기 정보: 일단 상대경로로 호출 (baseUrl 조합 X)
  const eventsRes = await fetch(`/api/events/england/football`, {
    cache: "no-store",
  });
  const events = await getJsonOrThrow(eventsRes);

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
