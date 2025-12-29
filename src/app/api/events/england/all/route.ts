// src/app/api/events/england/all/route.ts

import { NextResponse } from "next/server";
import { GET as getFootballEvents } from "../football/route";
import { GET as getRugbyEvents } from "../rugby/route";

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

    return NextResponse.json({ matches: merged });
  } catch (error) {
    console.error("❌ Error loading england all:", error);
    return NextResponse.json({ matches: [] }, { status: 500 });
  }
}
