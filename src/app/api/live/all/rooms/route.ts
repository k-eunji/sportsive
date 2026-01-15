// src/app/api/live/all/rooms/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const DAYS_AHEAD = 5;
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0, 0
    );

    const endOfFutureRange = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + DAYS_AHEAD,
      23, 59, 59, 999
    );

    const allEvents = [
      ...(await getAllEvents("football")),
      ...(await getAllEvents("rugby")),
      ...(await getAllEvents("tennis")),
    ];

    // 1️⃣ 날짜 필터
    const filtered = allEvents.filter((event: any) => {
      if (event.kind === "session") {
        if (!event.startDate || !event.endDate) return false;

        const start = new Date(event.startDate);
        const end = new Date(event.endDate);

        return end >= startOfToday && start <= endOfFutureRange;
      }

      const d = new Date(event.date);
      return d >= startOfToday && d <= endOfFutureRange;
    });

    // 🔥 오늘 anchor (session용)
    const todayAnchor = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      12, 0, 0, 0
    );

    // 2️⃣ Live rooms 생성
    const rooms = await Promise.all(
      filtered.map(async (event: any) => {
        const sport = event.sport ?? "football";

        const presenceSnap = await adminDb
          .collection("live_events")
          .doc(sport)
          .collection("events")
          .doc(String(event.id))
          .collection("presence")
          .get();

        const participants = presenceSnap.size;

        return {
          id: event.id,
          eventId: event.id,

          title:
            event.kind === "session"
              ? event.title
              : `${event.homeTeam} vs ${event.awayTeam}`,

          participants,

          // ✅ 핵심 수정: session은 오늘 기준
          datetime:
            event.kind === "session"
              ? todayAnchor.toISOString()
              : event.date,

          homeTeam: event.homeTeam ?? null,
          awayTeam: event.awayTeam ?? null,
          homeTeamLogo: event.homeTeamLogo ?? null,
          awayTeamLogo: event.awayTeamLogo ?? null,

          sport,
          kind: event.kind ?? "match",
        };
      })
    );

    return NextResponse.json({ rooms });
  } catch (err) {
    console.error("❌ GET /api/live/all/rooms failed:", err);
    return NextResponse.json({ rooms: [] }, { status: 500 });
  }
}
