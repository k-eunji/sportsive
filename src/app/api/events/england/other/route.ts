//api/events/england/other/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    matches: [],
  });
}
