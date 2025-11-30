// src/app/api/teams/[teamId]/rivalvote/create/route.ts
import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

type TeamRow = {
  id: string | number;
  name: string;
  logo: string;
};

async function fetchAllTeams(): Promise<TeamRow[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams`, {
    cache: "no-store",
  });

  const json = await res.json();
  return json.teams || [];
}

export async function POST(req: Request, context: any) {
  try {
    // 🔥 Next 15 방식: params 안전하게 가져오기
    const raw = context.params;
    const { teamId } = typeof raw.then === "function" ? await raw : raw;

    // 전체 EPL 팀 목록 가져오기
    const teams = await fetchAllTeams();

    // 현재 팀 제외 + 옵션 생성
    const options = teams
      .filter((t) => String(t.id) !== String(teamId))
      .filter((t) => String(t.id) !== "england")   // ← 추가!
      .map((t) => ({
        teamId: String(t.id),
        teamName: t.name,
        logo: t.logo,
        votes: 0,
      }));
    // Firestore 저장
    const docRef = db
      .collection("teams")
      .doc(teamId)
      .collection("rivalvote")
      .doc("module");

    await docRef.set({
      type: "rivalvote",
      createdAt: new Date().toISOString(),
      reactions: {
        likes: 0,
        comments: 0,
        participants: 0,
      },
      data: { options },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("🔥 RivalVote create error", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
