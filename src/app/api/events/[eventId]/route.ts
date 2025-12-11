// src/app/api/events/[eventId]/route.ts

import { NextResponse } from "next/server";
import { getEventById } from "@/lib/events";

interface EventParams {
  eventId: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<EventParams> }
) {
  const { eventId } = await params;

  try {
    const event = await getEventById(eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("❌ Failed to fetch event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
