// src/app/api/events/summary/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseServer";

export async function GET() {
  try {
    const now = new Date();

    // 🔹 UTC 기준 오늘 범위
    const startOfToday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    );

    const startOfTomorrow = new Date(
      startOfToday.getTime() + 24 * 60 * 60 * 1000
    );

    // 🔹 7일 이내
    const in7days = new Date(
      startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    // ──────────────────────────
    // 7일 이내 경기 (football + rugby)
    // ──────────────────────────
    const [{ count: football7d }, { count: rugby7d }] = await Promise.all([
      supabase
        .from("england_pl_football_matches")
        .select("*", { count: "exact", head: true })
        .gte("date", startOfToday.toISOString())
        .lt("date", in7days.toISOString()),

      supabase
        .from("england_rugby_matches")
        .select("*", { count: "exact", head: true })
        .gte("date", startOfToday.toISOString())
        .lt("date", in7days.toISOString()),
    ]);

    // ──────────────────────────
    // 오늘 경기
    // ──────────────────────────
    const [{ count: footballToday }, { count: rugbyToday }] =
      await Promise.all([
        supabase
          .from("england_pl_football_matches")
          .select("*", { count: "exact", head: true })
          .gte("date", startOfToday.toISOString())
          .lt("date", startOfTomorrow.toISOString()),

        supabase
          .from("england_rugby_matches")
          .select("*", { count: "exact", head: true })
          .gte("date", startOfToday.toISOString())
          .lt("date", startOfTomorrow.toISOString()),
      ]);

    // ──────────────────────────
    // LIVE 경기
    // ──────────────────────────
    const [{ count: footballLive }, { count: rugbyLive }] =
      await Promise.all([
        supabase
          .from("england_pl_football_matches")
          .select("*", { count: "exact", head: true })
          .in("status", ["LIVE", "IN_PLAY"]),

        supabase
          .from("england_rugby_matches")
          .select("*", { count: "exact", head: true })
          .in("status", ["LIVE", "IN_PLAY"]),
      ]);

    return NextResponse.json({
      upcoming7d: (football7d ?? 0) + (rugby7d ?? 0),
      today: (footballToday ?? 0) + (rugbyToday ?? 0),
      live: (footballLive ?? 0) + (rugbyLive ?? 0),
    });
  } catch (err) {
    console.error("❌ summary error:", err);
    return NextResponse.json(
      { upcoming7d: 0, today: 0, live: 0 },
      { status: 500 }
    );
  }
}
