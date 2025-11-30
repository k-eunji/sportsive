// src/app/teams/[teamId]/layout.tsx

import TeamLayoutClient from "./TeamLayout.client";

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;  // ★ 반드시 await

  return (
    <TeamLayoutClient teamId={teamId}>
      {children}
    </TeamLayoutClient>
  );
}
