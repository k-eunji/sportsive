// src/app/teams/[teamId]/matches/all/page.tsx

import TeamFullMatches from "./team-full-matches";

export default async function Page({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  return <TeamFullMatches teamId={teamId} />;
}
