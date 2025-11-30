//src/app/api/live/all/rooms/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events";
import { db as adminDb } from "@/lib/firebaseAdmin";

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

    const allEvents = await getAllEvents();

    const filtered = allEvents.filter((event: any) => {
      const d = new Date(event.date);
      return d >= startOfToday && d <= endOfFutureRange;
    });

    // ⛔ sport 누락 체크 (중요)
    filtered.forEach((e) => {
      if (!e.sport) {
        console.error("❌ ERROR: event.sport is undefined!", e);
      }
    });

    // 🔥 Firestore participants 불러오기 + 모든 디버깅 포함
    const rooms = await Promise.all(
      filtered.map(async (event: any) => {
        console.log("🔎 DEBUG EVENT:", {
          id: event.id,
          sport: event.sport,
          date: event.date,
        });

        const liveDocRef = adminDb
          .collection("live_events")
          .doc(event.sport)
          .collection("events")
          .doc(event.id);

        console.log("🔎 DEBUG PATH:", liveDocRef.path);

        const liveDoc = await liveDocRef.get();

        console.log("🔎 DEBUG liveDoc.exists:", liveDoc.exists);
        console.log("🔎 DEBUG liveDoc.data:", liveDoc.data());

        const participants = Number(liveDoc.data()?.participants || 0);

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
          sport: event.sport ?? "football",
        };
      })
    );

    return NextResponse.json({ rooms });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ rooms: [] }, { status: 500 });
  }
}
