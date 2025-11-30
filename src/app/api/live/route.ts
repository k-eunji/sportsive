// src/app/api/live/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // /api/live/all/rooms 을 Proxy 해줌
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/live/all/rooms`, {
      cache: "no-store",
    });

    const data = await res.json();

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
