// src/app/api/events/route.ts

import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/events/getAllEvents";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const window = url.searchParams.get("window") ?? "7d";

  const data = await getAllEvents(window);

  return NextResponse.json(data);
}
