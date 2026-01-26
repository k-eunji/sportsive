// src/app/api/events/england/tennis/route.ts

import { NextResponse } from "next/server";

/**
 * UK Tennis Events 2026
 *
 * Event model notes:
 * - kind: "session" (multi-day tournament)
 * - date: public opening anchor (for sorting & discovery)
 * - startDate / endDate: actual duration
 * - payload: optional metadata for session-type events
 */
export async function GET() {
  return NextResponse.json({
    matches: [
      {
        id: "tennis-nottingham-open-2026",
        sport: "tennis",
        kind: "session",

        title: "Lexus Nottingham Open 2026",

        date: "2026-06-15T11:00:00Z",
        startDate: "2026-06-15",
        endDate: "2026-06-21",

        venue: "Nottingham Tennis Centre",
        city: "Nottingham",
        region: "England",
        location: { lat: 52.9399, lng: -1.1956 },

        isPaid: true,
        homepageUrl:
          "https://www.wtatennis.com/tournaments/1080/nottingham/2026",

        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "11:00",
        },
      },

      {
        id: "tennis-queens-club-2026",
        sport: "tennis",
        kind: "session",

        title: "HSBC Championships – Queen’s Club 2026",

        date: "2026-06-08T11:30:00Z",
        startDate: "2026-06-08",
        endDate: "2026-06-21",

        venue: "Queen’s Club",
        city: "London",
        region: "England",
        location: { lat: 51.4871, lng: -0.2059 },

        isPaid: true,
        homepageUrl: "https://www.queensclub.co.uk/HSBC_Championships",

        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "11:30",
        },
      },

      {
        id: "tennis-wimbledon-2026",
        sport: "tennis",
        kind: "session",

        title: "The Championships, Wimbledon 2026",

        date: "2026-06-29T11:00:00Z",
        startDate: "2026-06-29",
        endDate: "2026-07-12",

        venue: "All England Lawn Tennis Club",
        city: "London",
        region: "England",
        location: { lat: 51.4340, lng: -0.2145 },

        isPaid: true,
        homepageUrl: "https://www.wimbledon.com/en_GB/",

        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "11:00",
        },
      },
    ],
  });
}
