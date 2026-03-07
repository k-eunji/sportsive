// src/app/api/export/events/route.ts

import { NextRequest } from "next/server";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { supabase } from "@/lib/supabaseServer";

const UK_SET = new Set([
  "england",
  "scotland",
  "wales",
  "northern ireland",
]);

function formatDateForICS(dateString: string) {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);

  const date = searchParams.get("date");
  const sport = searchParams.get("sport");
  const country = searchParams.get("country");
  const format = searchParams.get("format") || "csv";
  const source = searchParams.get("source");

  if (!date) {
    return new Response("Missing date", { status: 400 });
  }

  /* ================= FETCH ================= */

  const events = await getAllEventsRaw("180d");

  const filtered = events.filter((e: any) => {

    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    if (eventKey !== date) return false;

    const regionLower = e.region?.toLowerCase();

    if (country === "uk" && !UK_SET.has(regionLower)) {
      return false;
    }

    if (sport && e.sport?.toLowerCase() !== sport.toLowerCase()) {
      return false;
    }

    return true;
  });

  const ip =
    req.headers
      .get("x-vercel-forwarded-for")
      ?.split(",")[0]
      ?.trim() ??
    req.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ??
    req.headers.get("x-real-ip") ??
    null;

  /* ================= LOG ================= */

  await supabase.from("download_events").insert({
    page: source ?? "global-export",
    event_date: date,
    sport: sport ?? null,
    country: country ?? null,
    format,

    result_count: filtered.length,

    referrer: req.headers.get("referer"),
    user_agent: req.headers.get("user-agent"),
    ip_address: ip
  });
  /* ================= ICS ================= */

  if (format === "ics") {

    let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VenueScope//Sports Export//EN
`;

    filtered.forEach((event: any, i: number) => {

      const start =
        event.startDate ?? event.date ?? event.utcDate;

      const startFormatted = formatDateForICS(start);

      ics += `
BEGIN:VEVENT
UID:${date}-${i}@venuescope.io
DTSTAMP:${startFormatted}
DTSTART:${startFormatted}
SUMMARY:${event.title ?? `${event.homeTeam ?? ""} vs ${event.awayTeam ?? ""}`}
LOCATION:${event.venue ?? ""}
END:VEVENT
`;
    });

    ics += "END:VCALENDAR";

    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="events-${date}.ics"`
      }
    });
  }

  /* ================= CSV ================= */

  if (sport === "horse-racing") {

    const header =
    "Date,Course,Session\n";

    const rows = filtered.map((e: any) => {

      const start =
        e.startDate ?? e.date ?? e.utcDate;

      const d = start?.slice(0,10) ?? date;

      const session =
        e.sessionTime ??
        e.payload?.sessionTime ??
        "";

      return `"${d}","${e.venue ?? ""}","${session}"`;

    }).join("\n");

    return new Response(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="horse-racing-${date}.csv"`
      }
    });

  }

  /* ===== default sports CSV ===== */

  const header =
  "Date,Time,Sport,Home,Away,Venue,Competition\n";

  const rows = filtered.map((e: any) => {

    const start =
      e.startDate ?? e.date ?? e.utcDate;

    const d = start?.slice(0,10) ?? date;

    /* horse racing → session label */
    if (e.sport?.toLowerCase() === "horse-racing") {

      const session =
        e.sessionTime ??
        e.payload?.sessionTime ??
        "";

      return `"${d}","${session}","horse-racing","","","${e.venue ?? ""}",""`;
    }

    /* normal sports → kickoff time */

    let time = "";

    if (start) {
      const parsed = new Date(start);

      if (!isNaN(parsed.getTime())) {
        time = parsed.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/London"
        });
      }
    }

    return `"${d}","${time}","${e.sport ?? ""}","${e.homeTeam ?? ""}","${e.awayTeam ?? ""}","${e.venue ?? ""}","${e.competition ?? ""}"`;

  }).join("\n");
  return new Response(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="events-${date}.csv"`
    }
  });
}