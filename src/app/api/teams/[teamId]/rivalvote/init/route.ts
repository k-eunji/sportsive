// src/app/api/teams/[teamId]/rivalvote/init/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../../../../lib/supabaseServer";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    // ✅ Next 16 규칙
    const { teamId } = await params;

    const teamIdNum = Number(teamId);
    if (Number.isNaN(teamIdNum)) {
      return NextResponse.json(
        { error: "Invalid teamId" },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 🔽 Supabase: 리그 팀 전체 가져오기
    // -----------------------------------------
    const { data: teams, error } = await supabase
      .from("england_pl_football_teams")
      .select(`
        id,
        name,
        logo_url
      `);

    if (error || !teams) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to load teams" },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // 🔄 자기 팀 제외 → rival options 생성
    // -----------------------------------------
    const options = teams
      .filter((t) => t.id !== teamIdNum)
      .map((t) => ({
        teamId: t.id,
        teamName: t.name,
        logo: t.logo_url,
        votes: 0,
      }));

    // -----------------------------------------
    // 🔥 Firebase Admin 저장 (기존 로직 유지)
    // -----------------------------------------
    const ref = adminDb
      .collection("teams")
      .doc(teamId)
      .collection("rivalvote")
      .doc("module");

    await ref.set({
      options,
      participants: 0,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      optionsCount: options.length,
    });
  } catch (err) {
    console.error("RivalVote INIT error:", err);
    return NextResponse.json(
      { error: "Failed to initialize rivalvote" },
      { status: 500 }
    );
  }
}
