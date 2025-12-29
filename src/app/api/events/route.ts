// src/app/api/events/route.ts

import { NextResponse } from "next/server";
import { GET as getFootballEvents } from "./england/football/route";
import { GET as getRugbyEvents } from "./england/rugby/route";

export async function GET() {
  try {
    const [footballRes, rugbyRes] = await Promise.all([
      getFootballEvents(),
      getRugbyEvents(),
    ]);

    const footballData = await footballRes.json();
    const rugbyData = await rugbyRes.json();

    const merged = [
      ...(footballData.matches ?? []),
      ...(rugbyData.matches ?? []),
    ];

    return NextResponse.json({
      events: merged,
    });
  } catch (error) {
    console.error("❌ Error combining event APIs:", error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
