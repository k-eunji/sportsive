//src/app/api/admin/update-event/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const {
      sport,
      id,
      date,
      startDate,
      endDate,
      sessionTime,
      status,
    } = await req.json();

    if (!sport || !id) {
      return NextResponse.json({ error: "Missing sport or id" });
    }

    /* =========================
       HORSE RACING
       DB: race_sessions
       fields: date (YYYY-MM-DD), time
    ========================= */
    if (sport === "horse-racing") {
      const { error } = await supabase
        .from("race_sessions")
        .update({
          ...(date && { date }),
          ...(sessionTime && { time: sessionTime }),
        })
        .eq("id", id);

      if (error) return NextResponse.json({ error });

      return NextResponse.json({ success: true });
    }

    /* =========================
       FOOTBALL
    ========================= */
    if (sport === "football") {
      const { error } = await supabase
        .from("england_pl_football_matches")
        .update({
          ...(date && { date }),
          ...(status && { status }),
        })
        .eq("id", id);

      if (error) return NextResponse.json({ error });

      return NextResponse.json({ success: true });
    }

    /* =========================
       TENNIS (session)
    ========================= */
    if (sport === "tennis") {
      const { error } = await supabase
        .from("england_tennis_sessions")
        .update({
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
        })
        .eq("id", id);

      if (error) return NextResponse.json({ error });

      return NextResponse.json({ success: true });
    }

    /* =========================
       DARTS (session)
    ========================= */
    if (sport === "darts") {
      const { error } = await supabase
        .from("england_darts_sessions")
        .update({
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
        })
        .eq("id", id);

      if (error) return NextResponse.json({ error });

      return NextResponse.json({ success: true });
    }

    /* =========================
       기타 단일 date 종목
    ========================= */
    const tableMap: Record<string, string> = {
      rugby: "rugby_matches",
      basketball: "basketball_matches",
      cricket: "cricket_matches",
    };

    const table = tableMap[sport];

    if (!table) {
      return NextResponse.json({ error: "Unsupported sport" });
    }

    const { error } = await supabase
      .from(table)
      .update({
        ...(date && { date }),
        ...(status && { status }),
      })
      .eq("id", id);

    if (error) return NextResponse.json({ error });

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Unexpected error" });
  }
}

