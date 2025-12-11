// src/app/api/events/england/all/route.ts

import { NextResponse } from "next/server";
import { GET as getFootballEvents } from "../football/route";

export async function GET() {
  try {
    const footballRes = await getFootballEvents();
    const data = await footballRes.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error loading england all:", error);
    return NextResponse.json({ matches: [] }, { status: 500 });
  }
}
