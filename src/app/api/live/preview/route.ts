//src/app/api/live/preview/route.ts

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0, 0
    );

    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23, 59, 59, 999
    );

    const allEvents = [
      ...(await getAllEvents("football")),
      ...(await getAllEvents("rugby")),
      ...(await getAllEvents("tennis")),
    ];

    // ✅ 오늘 경기만 (메인 프리뷰 목적)
    const todayEvents = allEvents.filter((event: any) => {
      if (event.kind === "session") {
        if (!event.startDate || !event.endDate) return false;
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        return end >= startOfToday && start <= endOfToday;
      }

      const d = new Date(event.date);
      return d >= startOfToday && d <= endOfToday;
    });

    const rooms = await Promise.all(
      todayEvents.map(async (event: any) => {
        const sport = event.sport ?? "football";

        // 1️⃣ presence (실시간 접속자)
        const presenceSnap = await adminDb
          .collection("live_events")
          .doc(sport)
          .collection("events")
          .doc(String(event.id))
          .collection("presence")
          .get();

        // 2️⃣ 💬 채팅한 사람 누적 수 (중복 제거)
        const messagesSnap = await adminDb
          .collection("live_events")
          .doc(sport)
          .collection("events")
          .doc(String(event.id))
          .collection("messages")
          .get();

        const uniqueUsers = new Set<string>();
        messagesSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.userId) uniqueUsers.add(data.userId);
        });

        return {
          id: event.id,
          eventId: event.id,

          title:
            event.kind === "session"
              ? event.title
              : `${event.homeTeam} vs ${event.awayTeam}`,

          sport,
          datetime:
            event.kind === "session"
              ? startOfToday.toISOString()
              : event.date,

          homeTeam: event.homeTeam ?? null,
          awayTeam: event.awayTeam ?? null,
          homeTeamLogo: event.homeTeamLogo ?? null,
          awayTeamLogo: event.awayTeamLogo ?? null,

          participants: presenceSnap.size,      // 👥 실시간
          commenters: uniqueUsers.size,         // 💬 채팅한 사람 누적
        };
      })
    );

    return NextResponse.json({ rooms });
  } catch (err) {
    console.error("❌ GET /api/live/preview failed:", err);
    return NextResponse.json({ rooms: [] }, { status: 500 });
  }
}
