//src/app/api/debug/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    envExists: process.env.FIREBASE_PRIVATE_KEY_B64 ? true : false,
    length: process.env.FIREBASE_PRIVATE_KEY_B64?.length ?? 0,
  });
}
