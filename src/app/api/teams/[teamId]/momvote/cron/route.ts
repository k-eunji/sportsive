//src/app/api/teams/[teamId]/momvote/cron/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: any) {
  const { teamId } = await ctx.params;

  // 1) 자동 생성
  await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/${teamId}/momvote/auto-create`,
    { method: "POST" }
  );

  // 2) 자동 LOCK
  await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/${teamId}/momvote/auto-lock`,
    { method: "POST" }
  );

  // 3) 백업
  await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/teams/${teamId}/momvote/backup`,
    { method: "POST" }
  );

  return NextResponse.json({
    success: true,
    message: "auto-create, auto-lock, backup completed",
  });
}
