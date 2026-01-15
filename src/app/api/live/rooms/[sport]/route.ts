// src/app/api/live/rooms/[sport]/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events";
import { adminDb } from "@/lib/firebaseAdmin";
import { isEventActiveInWindow } from "@/lib/events/lifecycle";

export async function GET(
  _req: Request,
  context: { params: Promise<{ sport: string }> }
) {
  const { sport } = await context.params;
  const normalizedSport = (sport ?? "").toLowerCase();

  const SUPPORTED_SPORTS = ["football", "rugby", "tennis", "all"];
  if (!SUPPORTED_SPORTS.includes(normalizedSport)) {
    return NextResponse.json({ rooms: [] });
  }

  try {
    const now = new Date();

    const windowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const windowEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 5,
      23, 59, 59
    );

    let allEvents: any[] = [];

    if (normalizedSport === "all") {
      allEvents = [
        ...(await getAllEvents("football")),
        ...(await getAllEvents("rugby")),
        ...(await getAllEvents("tennis")),
      ];
    } else {
      allEvents = await getAllEvents(
        normalizedSport as "football" | "rugby" | "tennis"
      );
    }

    const activeEvents = allEvents.filter((event) =>
      isEventActiveInWindow(event, windowStart, windowEnd)
    );

    // 🔥 session 오늘 anchor
    const todayAnchor = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      12, 0, 0, 0
    );

    const rooms = await Promise.all(
      activeEvents.map(async (event: any) => {
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

        const isSession = event.kind === "session";

        return {
          id: event.id,
          eventId: event.id,
          sport: event.sport,

          title: isSession
            ? event.title
            : `${event.homeTeam} vs ${event.awayTeam}`,

          participants,

          // ✅ 핵심
          datetime: isSession
            ? todayAnchor.toISOString()
            : event.date,

          homeTeam: isSession ? null : event.homeTeam,
          awayTeam: isSession ? null : event.awayTeam,

          homeTeamLogo: isSession ? null : event.homeTeamLogo ?? null,
          awayTeamLogo: isSession ? null : event.awayTeamLogo ?? null,

          kind: event.kind ?? "match",
        };
      })
    );

    return NextResponse.json({ rooms });
  } catch (err) {
    console.error("❌ GET /api/live/rooms/[sport] failed:", err);
    return NextResponse.json({ rooms: [] }, { status: 500 });
  }
}
