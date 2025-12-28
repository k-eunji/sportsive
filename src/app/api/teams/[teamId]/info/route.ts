// src/app/api/teams/[teamId]/info/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseServer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  // ✅ Next 16 규칙: params는 Promise
  const { teamId } = await params;

  const idNum = Number(teamId);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({
      teamName: null,
      externalId: null,
    });
  }

  try {
    const { data: team, error } = await supabase
      .from("england_pl_football_teams")
      .select(`
        id,
        name
      `)
      .eq("id", idNum)
      .single();

    if (error || !team) {
      return NextResponse.json({
        teamName: null,
        externalId: null,
      });
    }

    return NextResponse.json({
      teamName: team.name,
      externalId: String(team.id),
    });
  } catch (err) {
    console.error("❌ Team info error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
