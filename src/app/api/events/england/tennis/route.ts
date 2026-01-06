import { NextResponse } from "next/server";

/**
 * UK Tennis Events 2026
 * - Tournament = period event
 * - date = anchor (start)
 * - startDate / endDate = real duration
 */
export async function GET() {
  return NextResponse.json({
    matches: [
      {
        id: "tennis-nottingham-challenger-2026",
        sport: "tennis",
        kind: "session",

        title: "Lexus Nottingham Challenger 2026",

        date: "2026-01-05T10:00:00Z",      // anchor
        startDate: "2026-01-05",
        endDate: "2026-01-10",

        venue: "Nottingham Tennis Centre",
        city: "Nottingham",
        region: "England",
        location: { lat: 52.9399, lng: -1.1956 },

        free: false,
        isPaid: true,
        attendees: [],

        homepageUrl:
          "https://www.atptour.com/en",
      },

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

        free: false,
        isPaid: true,
        attendees: [],

        homepageUrl:
          "https://www.wtatennis.com/tournaments/1080/nottingham/2026",
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

        free: false,
        isPaid: true,
        attendees: [],

        homepageUrl: "https://www.queensclub.co.uk/HSBC_Championships",
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

        free: false,
        isPaid: true,
        attendees: [],

        homepageUrl: "https://www.wimbledon.com/en_GB/",
      },
    ],
  });
}
