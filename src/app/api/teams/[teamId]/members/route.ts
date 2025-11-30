// src/app/api/teams/[teamId]/members/route.ts
import { NextResponse } from "next/server";

// 임시 Mock 데이터
const mockMembersByTeam: Record<
  string,
  { id: string; displayName: string; photoURL?: string | null; role?: string | null }[]
> = {
  arsenal: [
    { id: "u1", displayName: "Alice", role: "Captain", photoURL: null },
    { id: "u2", displayName: "Bob", role: "Forward", photoURL: null },
  ],
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params; // ✅ 반드시 await 필요

  const members = mockMembersByTeam[teamId] ?? [];
  return NextResponse.json(members);
}
