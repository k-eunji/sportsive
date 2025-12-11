// src/app/api/live/all/rooms/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events";
import { db as adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const DAYS_AHEAD = 5;
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfFutureRange = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + DAYS_AHEAD,
      23, 59, 59, 999
    );

    const allEvents = await getAllEvents();

    // 날짜 필터링
    const filtered = allEvents.filter((event: any) => {
      const d = new Date(event.date);
      return d >= startOfToday && d <= endOfFutureRange;
    });

    const rooms = await Promise.all(
      filtered.map(async (event: any) => {
        const sport = event.sport ?? "football"; // ★ 누락 방지

        const liveDoc = await adminDb
          .collection("live_events")
          .doc(sport)
          .collection("events")
          .doc(event.id)
          .get();

        const participants = Number(liveDoc.data()?.participants ?? 0);

        return {
          id: event.id,
          eventId: event.id,
          title: `${event.homeTeam} vs ${event.awayTeam}`,
          participants,
          datetime: event.date,
          homeTeam: event.homeTeam,
          awayTeam: event.awayTeam,
          homeTeamLogo: event.homeTeamLogo ?? null,
          awayTeamLogo: event.awayTeamLogo ?? null,
          sport,
        };
      })
    );

    return NextResponse.json({ rooms });
  } catch (err) {
    console.error("❌ GET /live/all/rooms failed:", err);
    return NextResponse.json({ rooms: [] }, { status: 500 });
  }
}
