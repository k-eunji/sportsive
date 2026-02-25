// src/app/api/events/england/horseRacing/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseServer";

function mapSessionToWindow(time?: string | null) {
  const t = (time ?? "").toLowerCase();

  // Horse racing meetings use session-based windows
  if (t.includes("afternoon")) {
    return { startHour: 11, durationHours: 8 }; // 11:00–19:00
  }

  if (t.includes("evening")) {
    return { startHour: 16, durationHours: 8 }; // 16:00–00:00
  }

  if (t.includes("floodlit")) {
    return { startHour: 19, durationHours: 6 }; // 19:00–01:00
  }

  // fallback
  return { startHour: 11, durationHours: 8 };
}

export async function GET() {
  try {
    const { data: sessions, error } = await supabase
      .from("race_sessions")
      .select(`
        id,
        date,
        time,
        sport,
        kind,
        course,
        is_paid,
        code,
        courses:course (
          venue,
          city,
          region,
          lat,
          lng,
          homepage_url
        )
      `)

      .order("date", { ascending: true });

    if (error || !sessions) {
      console.error(error);
      return NextResponse.json({ matches: [] });
    }

    const matches = sessions.map((s: any) => {
      const { startHour, durationHours } = mapSessionToWindow(s.time);

      const start = new Date(
        `${s.date}T${String(startHour).padStart(2, "0")}:00:00`
      );

      const end = new Date(
        start.getTime() + durationHours * 60 * 60 * 1000
      );

      return {
        id: String(s.id),
        sport: "horse-racing",
        kind: s.kind || "session",

        title: `${s.courses?.venue}`,
        code: s.code, 
        date: start.toISOString(),
        startDate: start.toISOString(),
        endDate: end.toISOString(),

        sessionTime: s.time, // "Afternoon" | "Evening" | "Floodlit"

        venue: s.courses?.venue,
        city: s.courses?.city,
        region: s.courses?.region,

        homepageUrl: s.courses?.homepage_url,
        
        location: {
          lat: s.courses?.lat,
          lng: s.courses?.lng,
        },
        
        isPaid: s.is_paid === true,

        payload: {
          course: s.course,
          sessionTime: s.time, // Afternoon / Evening / Floodlit
          startHour,
          durationHours,
        },

      };
    });

    return NextResponse.json({ matches });
  } catch (err) {
    console.error("❌ horse racing events error:", err);
    return NextResponse.json({ matches: [] });
  }
}
