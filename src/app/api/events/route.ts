// src/app/api/events/route.ts

import { NextResponse } from "next/server";
import { GET as getFootballEvents } from "./england/football/route";

export async function GET() {
  try {
    const footballRes = await getFootballEvents();
    const data = await footballRes.json();

    return NextResponse.json({
      events: data.matches ?? [],
    });
  } catch (error) {
    console.error("❌ Error combining event APIs:", error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
