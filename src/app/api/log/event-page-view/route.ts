///src/app/api/log/event-page-view/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { eventId, clientId, sport, city } = body;

  if (!eventId || !clientId) {
    return NextResponse.json(
      { error: "Bad request" },
      { status: 400 }
    );
  }

  await supabase.from("event_page_views").insert({
    event_id: eventId,
    client_id: clientId,
    sport,
    city,
  });

  return NextResponse.json({ ok: true });
}
