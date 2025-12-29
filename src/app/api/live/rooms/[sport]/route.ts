// src/app/api/live/rooms/[sport]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request, context: { params: Promise<{ sport: string }> }) {
  const { sport } = await context.params;
  const normalizedSport = (sport ?? "football").toLowerCase() as "football" | "rugby" | "all";

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfFutureRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 23, 59, 59);

    // ✅ sport를 넘겨서 해당 테이블에서만 이벤트를 가져오기
    const allEvents =
      normalizedSport === "all"
        ? [
            ...(await getAllEvents("football")),
            ...(await getAllEvents("rugby")),
          ]
        : await getAllEvents(normalizedSport);

    const filtered = allEvents.filter((event: any) => {
      const d = new Date(event.date);
      return d >= startOfToday && d <= endOfFutureRange;
    });

    const rooms = await Promise.all(
      filtered.map(async (event: any) => {
        const liveDoc = await adminDb
          .collection("live_events")
          .doc(normalizedSport === "all" ? event.sport : normalizedSport) // ✅ all일 때는 event.sport 사용
          .collection("events")
          .doc(String(event.id))
          .get();

        const participants = Number(liveDoc.data()?.participants ?? 0);

        return {
          id: event.id,
          eventId: event.id,
          sport: normalizedSport === "all" ? event.sport : normalizedSport, // ✅ 탭 sport와 일치
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
    console.error("❌ GET /live/rooms/[sport] failed:", err);
    return NextResponse.json({ rooms: [] }, { status: 500 });
  }
}
