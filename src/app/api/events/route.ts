// src/app/api/events/route.ts

import { NextResponse } from "next/server";
import { GET as getFootballEvents } from "./england/football/route";
import { GET as getRugbyEvents } from "./england/rugby/route";
import { GET as getTennisEvents } from "./england/tennis/route";
import { GET as getHorseRacingEvents } from "./england/horseRacing/route";
import { isEventActiveInWindow } from "@/lib/events/lifecycle";
import { buildAreaIndex } from "@/lib/events/buildAreaIndex";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const window = url.searchParams.get("window") ?? "7d";

    const [
      footballRes,
      rugbyRes,
      tennisRes,
      horseRacingRes,
    ] = await Promise.all([
      getFootballEvents(),
      getRugbyEvents(),
      getTennisEvents(),
      getHorseRacingEvents(),
    ]);

    const footballData = await footballRes.json();
    const rugbyData = await rugbyRes.json();
    const tennisData = await tennisRes.json();
    const horseRacingData = await horseRacingRes.json();

    const merged = [
      ...(footballData.matches ?? []),
      ...(rugbyData.matches ?? []),
      ...(tennisData.matches ?? []),
      ...(horseRacingData.matches ?? []),
    ];

    if (window === "180d") {
      const areas = buildAreaIndex(merged);
      return NextResponse.json({ areas });
    }

    const now = new Date();
    const windowEnd = new Date(now);

    if (window === "today") {
      windowEnd.setHours(23, 59, 59, 999);
    } else if (window === "7d") {
      windowEnd.setDate(windowEnd.getDate() + 7);
    } else if (window === "30d") {
      windowEnd.setDate(windowEnd.getDate() + 30);
    } else if (window === "180d") {
      windowEnd.setDate(windowEnd.getDate() + 180);
    }

    const filtered = merged
      .filter((e: any) => isEventActiveInWindow(e, now, windowEnd))
      .map((e: any) => ({
        ...e,
        startAtUtc: e.date, // sorting & discovery 기준
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.startAtUtc).getTime() -
          new Date(b.startAtUtc).getTime()
      );

    return NextResponse.json({ events: filtered });
  } catch (error) {
    console.error("❌ Error combining event APIs:", error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
