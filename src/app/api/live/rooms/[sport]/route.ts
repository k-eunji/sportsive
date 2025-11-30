// src/app/api/live/rooms/[sport]/route.ts

import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events";
import { db as adminDb } from "@/lib/firebaseAdmin";

export async function GET(
  req: Request,
  context: { params: Promise<{ sport: string }> }
) {
  const { sport } = await context.params;

  try {
    const allEvents = await getAllEvents();
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfFutureRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 23, 59, 59, 999);

    const filtered = allEvents.filter((event: any) => {
      const d = new Date(event.date);

      return (
        event.sport === sport &&
        d >= startOfToday &&
        d <= endOfFutureRange
      );
    });

    const rooms = await Promise.all(
      filtered.map(async (event: any) => {
        const liveDoc = await adminDb
          .collection("live_events")
          .doc(sport)
          .collection("events")
          .doc(event.id)
          .get();

        const participants = liveDoc.exists ? liveDoc.data()?.participants ?? 0 : 0;

        return {
          id: event.id,
          eventId: event.id,
          sport: event.sport,
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
    console.error(err);
    return NextResponse.json({ rooms: [] }, { status: 500 });
  }
}
