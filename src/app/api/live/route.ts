// src/app/api/live/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/live/all/rooms`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      rooms: data?.rooms ?? [],
    });
  } catch (err) {
    console.error("🔥 /api/live failed:", err);

    return NextResponse.json(
      { rooms: [], error: "Live fetch failed" },
      { status: 500 }
    );
  }
}
