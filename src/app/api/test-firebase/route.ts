// src/app/api/test-firebase/route.ts
import { NextRequest, NextResponse } from "next/server";

const mockMatches = [
  { id: "match1", title: "Soccer Game", location: "Seoul Stadium", date: "2025-10-15" },
  { id: "match2", title: "Basketball Game", location: "Busan Arena", date: "2025-10-16" },
];

export async function GET(_req: NextRequest) {
  try {
    console.log("Mock matches data:", mockMatches);

    return NextResponse.json({ data: mockMatches });
  } catch (err) {
    console.error("❌ Mock API Test Error:", err);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
