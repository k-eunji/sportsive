//api/events/england/f1/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    matches: [],
  });
}
