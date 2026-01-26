// src/app/api/go/ticket/route.ts
import { NextRequest, NextResponse } from "next/server";

type TicketClickLog = {
  type: "ticket_click";
  ts: string;
  eventId: string;
  sport: string | null;
  city: string | null;
  userAgent: string | null;
  ip: string | null;
  referrer: string | null;
};

async function logTicketClick(log: TicketClickLog) {
  /**
   * KPI source of truth
   * - Used for investor metrics
   * - Independent from GA / client-side tracking
   */
  console.log(JSON.stringify(log));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const eventId = searchParams.get("eventId");
  const target = searchParams.get("target");

  if (!eventId || !target) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // ✅ target URL validation (security & data integrity)
  try {
    new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  // ✅ Client IP extraction (Vercel / proxy safe)
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
    userAgent: req.headers.get("user-agent"),
    ip,
    referrer: req.headers.get("referer"),
  });

  // ✅ Redirect after logging
  return NextResponse.redirect(target, { status: 302 });
}
