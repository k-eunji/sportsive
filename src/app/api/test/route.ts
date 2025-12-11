// src/app/api/test/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const keyLength = process.env.FIREBASE_PRIVATE_KEY_B64?.length ?? null;

    return NextResponse.json({
      key: keyLength,
    });
  } catch (err) {
    console.error("❌ /api/test error:", err);
    return NextResponse.json(
      { error: "Failed to read environment variable" },
      { status: 500 }
    );
  }
}
