// src/app/api/events/summary/route.ts

import { NextResponse } from "next/server";
import { isEventActiveInWindow } from "@/lib/events/lifecycle";

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

    // ✅ England 전체 이벤트 카탈로그 로드
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/england/all`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error("Failed to load england events");
    }

    const { matches } = await res.json();
    const events = matches ?? [];

    // ──────────────────────────
    // 오늘 활성 이벤트
    // ──────────────────────────
    const today = events.filter((e: any) =>
      isEventActiveInWindow(e, startOfToday, startOfTomorrow)
    ).length;

    // ──────────────────────────
    // 7일 내 활성 이벤트
    // ──────────────────────────
    const upcoming7d = events.filter((e: any) =>
      isEventActiveInWindow(e, startOfToday, in7days)
    ).length;

    // ──────────────────────────
    // LIVE 개념 = "지금 이 순간 활성"
    // (match / session / round 공통)
    // ──────────────────────────
    const live = events.filter((e: any) =>
      isEventActiveInWindow(e, now, now)
    ).length;

    return NextResponse.json({
      today,
      upcoming7d,
      live,
    });
  } catch (err) {
    console.error("❌ summary error:", err);
    return NextResponse.json(
      { today: 0, upcoming7d: 0, live: 0 },
      { status: 500 }
    );
  }
}
