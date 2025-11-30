// src/app/teams/[teamId]/rival-vote/page.tsx

import RivalVotePageClient from "./RivalVotePage.client";

export default async function Page({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;   // ⭐ 반드시 await 해야 정상 동작!

  return <RivalVotePageClient teamId={teamId} />;
}
