// src/app/api/export/uk-sports/route.ts

import { NextRequest } from "next/server";
import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import { supabase } from "@/lib/supabaseServer";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

function formatDateForICS(dateString: string) {
  const date = new Date(dateString);
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .split(".")[0] + "Z";
}

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const format = searchParams.get("format") || "csv";

  if (!date) {
    return new Response("Missing date", { status: 400 });
  }

  /* ================= DOWNLOAD LOG ================= */

  await supabase.from("download_events").insert({
    page: "uk-sports",
    event_date: date,
    format: format,
  });

  /* ================= FETCH EVENTS ================= */

  const events = await getAllEventsRaw("180d");

  const ukEvents = events.filter((e: any) => {
    const eventKey =
      (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 10);

    return (
      UK_REGIONS.includes(e.region?.toLowerCase()) &&
      eventKey === date
    );
  });

  /* ================= ICS ================= */

  if (format === "ics") {

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VenueScope//UK Sports//EN
`;

    ukEvents.forEach((event: any, index: number) => {

      const start = event.startDate ?? event.date ?? event.utcDate;
      const startFormatted = formatDateForICS(start);

      icsContent += `
BEGIN:VEVENT
UID:${date}-${index}@venuescope.io
DTSTAMP:${startFormatted}
DTSTART:${startFormatted}
SUMMARY:${event.title ?? `${event.homeTeam ?? ""} vs ${event.awayTeam ?? ""}`} (${event.competition ?? ""})
LOCATION:${event.venue ?? "United Kingdom"}
END:VEVENT
`;
    });

    icsContent += "END:VCALENDAR";

    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": `attachment; filename="uk-sports-${date}.ics"`,
      },
    });
  }

  /* ================= CSV ================= */

  const header =
    "Date,Sport,Home Team,Away Team,Venue,Competition\n";

    const rows = ukEvents.map((event: any) => {

    const start = event.startDate ?? event.date ?? event.utcDate;
    const eventDate = start?.slice(0, 10) ?? date;

    return `"${eventDate}","${event.sport ?? ""}","${event.homeTeam ?? ""}","${event.awayTeam ?? ""}","${event.venue ?? ""}","${event.competition ?? ""}"`;

    }).join("\n");

    const csvContent = header + rows;


  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="uk-sports-${date}.csv"`,
    },
  });

}
