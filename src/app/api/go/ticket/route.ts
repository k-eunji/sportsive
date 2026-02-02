// src/app/api/go/ticket/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseServer";

/**
 * Ticket click = high-intent action
 * This log is the KPI source of truth for investor conversations.
 */
type TicketClickLog = {
  type: "ticket_click";
  ts: string;
  eventId: string;
  sport: string | null;
  city: string | null;

  // where the click happened
  source: "snap_card" | "map" | "list" | "event_page" | "unknown";

  userAgent: string | null;
  ip: string | null;
  referrer: string | null;
};

async function logTicketClick(log: TicketClickLog) {
  await supabase.from("ticket_clicks").insert({
    event_id: log.eventId,
    sport: log.sport,
    city: log.city,
    source: log.source,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const eventId = searchParams.get("eventId");
  const target = searchParams.get("target");

  if (!eventId || !target) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // ✅ Validate target URL (security & data integrity)
  try {
    new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  // ✅ Click source (default: unknown)
  const sourceParam = searchParams.get("source");
  const source: TicketClickLog["source"] =
    sourceParam === "snap_card" ||
    sourceParam === "map" ||
    sourceParam === "list" ||
    sourceParam === "event_page"
      ? sourceParam
      : "unknown";

  // ✅ Client IP extraction (proxy / Vercel safe)
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : null;

  await logTicketClick({
    type: "ticket_click",
    ts: new Date().toISOString(),
    eventId,
    sport: searchParams.get("sport"),
    city: searchParams.get("city"),
    source,
    userAgent: req.headers.get("user-agent"),
    ip,
    referrer: req.headers.get("referer"),
  });

  // ✅ Redirect after logging
  return NextResponse.redirect(target, { status: 302 });
}
