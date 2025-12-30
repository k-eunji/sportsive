// src/app/api/live/rooms/[sport]/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  req: Request,
  context: { params: Promise<{ sport: string }> }
) {
  const { sport } = await context.params;
  const normalizedSport = (sport ?? "").toLowerCase();

  // ✅ 1. Live에서 실제로 지원하는 sport만 허용
  const SUPPORTED_SPORTS = ["football", "rugby", "all"];

  // 🚫 tennis, f1, golf, cricket 등은 즉시 빈 배열 반환
  if (!SUPPORTED_SPORTS.includes(normalizedSport)) {
    return NextResponse.json({ rooms: [] });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfFutureRange = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 5,
      23,
      59,
      59
    );

    // ✅ 2. sport에 맞는 이벤트만 가져오기
    const allEvents =
      normalizedSport === "all"
        ? [
            ...(await getAllEvents("football")),
            ...(await getAllEvents("rugby")),
          ]
        : await getAllEvents(normalizedSport as "football" | "rugby");

    // ✅ 3. 날짜 필터
    const filtered = allEvents.filter((event: any) => {
      const d = new Date(event.date);
      return d >= startOfToday && d <= endOfFutureRange;
    });

    // ✅ 4. Live rooms 생성
    const rooms = await Promise.all(
      filtered.map(async (event: any) => {
        const sportKey =
          normalizedSport === "all" ? event.sport : normalizedSport;

        const presenceSnap = await adminDb
          .collection("live_events")
          .doc(sportKey)
          .collection("events")
          .doc(String(event.id))
          .collection("presence")
          .get();

        const participants = presenceSnap.size;

        return {
          id: event.id,
          eventId: event.id,
          sport:
            normalizedSport === "all"
              ? event.sport
              : normalizedSport,
          title: `${event.homeTeam} vs ${event.awayTeam}`,
          participants,
          datetime: event.date,
          homeTeam: event.homeTeam,
          awayTeam: event.awayTeam,
          homeTeamLogo: event.homeTeamLogo ?? null,
          awayTeamLogo: event.awayTeamLogo ?? null,
        };
      })
    );

    return NextResponse.json({ rooms });
  } catch (err) {
    console.error("❌ GET /api/live/rooms/[sport] failed:", err);
    return NextResponse.json({ rooms: [] }, { status: 500 });
  }
}
