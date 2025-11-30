// src/app/teams/[teamId]/mom-vote/page.tsx

export const dynamic = "force-dynamic"; 

import MomVotePageClient from "./MomVotePage.client";

export default async function Page({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;   // ⭐ Next가 요구하는 방식
  return <MomVotePageClient teamId={teamId} />;
}
