// src/app/api/export/london-sports/route.ts

import { NextRequest } from "next/server";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { supabase } from "@/lib/supabaseServer";

function formatDateForICS(dateString: string) {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const format = searchParams.get("format") || "csv";

  if (!date) {
    return new Response("Missing date", { status: 400 });
  }

  await supabase.from("download_events").insert({
    page: "london-sports",
    event_date: date,
    format: format,
  });

  const events = await getAllEventsRaw("180d");

  const londonEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      e.city?.toLowerCase() === "london" &&
      eventKey === date
    );
  });

  if (format === "ics") {

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VenueScope//London Sports//EN
`;

    londonEvents.forEach((event: any, index: number) => {

      const start = event.startDate ?? event.date ?? event.utcDate;
      const startFormatted = formatDateForICS(start);

      icsContent += `
BEGIN:VEVENT
UID:${date}-${index}@venuescope.io
DTSTAMP:${startFormatted}
DTSTART:${startFormatted}
SUMMARY:${event.title ?? "Sports Event"} (${event.competition ?? ""})
LOCATION:${event.venue ?? "London"}
END:VEVENT
`;
    });

    icsContent += "END:VCALENDAR";

    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="london-sports-${date}.ics"`,
      },
    });
  }

  /* ================= CSV ================= */

  const header = "Date,Sport,Home Team,Away Team,Venue,Competition\n";

  const rows = londonEvents.map((event: any) => {

    const start = event.startDate ?? event.date ?? event.utcDate;
    const eventDate = start?.slice(0, 10) ?? date;

    return `"${eventDate}",
  "${event.sport ?? ""}",
  "${event.homeTeam ?? ""}",
  "${event.awayTeam ?? ""}",
  "${event.venue ?? ""}",
  "${event.competition ?? ""}"`;

  }).join("\n");

  return new Response(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="london-sports-${date}.csv"`,
    },
  });

}
