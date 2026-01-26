// src/app/api/events/england/dart/route.ts


import { NextResponse } from "next/server";

/**
 * UK Darts Events 2026
 *
 * Event model notes:
 * - kind: "session" (multi-day tournament / league night series)
 * - date: public opening anchor (for sorting & discovery)
 * - startDate / endDate: actual duration
 * - payload: optional metadata for session-type events
 */
export async function GET() {
  return NextResponse.json({
    matches: [
      {
        id: "darts-winmau-world-masters-2026",
        sport: "darts",
        kind: "session",

        title: "Winmau World Masters 2026",

        date: "2026-01-28T18:00:00Z",
        startDate: "2026-01-28",
        endDate: "2026-02-01",

        venue: "Marshall Arena",
        city: "Milton Keynes",
        region: "England",
        location: { lat: 52.0085946692037, lng: -0.7329127932004601 },
        isPaid: true,
        homepageUrl: "https://www.pdc.tv/tickets",

        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "18:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-1",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 1",

        date: "2026-02-05T19:00:00Z",
        startDate: "2026-02-05",
        endDate: "2026-02-05",

        venue: "Utilita Arena",
        city: "Newcastle",
        region: "England",
        location: { lat: 54.9699, lng: -1.6214 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-3",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 3",

        date: "2026-02-19T19:00:00Z",
        startDate: "2026-02-19",
        endDate: "2026-02-19",

        venue: "OVO Hydro",
        city: "Glasgow",
        region: "Scotland",
        location: { lat: 55.8609, lng: -4.2850 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-4",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 4",

        date: "2026-02-26T19:00:00Z",
        startDate: "2026-02-26",
        endDate: "2026-02-26",

        venue: "SSE Arena",
        city: "Belfast",
        region: "Northern Ireland",
        location: { lat: 54.6028, lng: -5.9181 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-5",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 5",

        date: "2026-03-05T19:00:00Z",
        startDate: "2026-03-05",
        endDate: "2026-03-05",

        venue: "Utilita Arena",
        city: "Cardiff",
        region: "Wales",
        location: { lat: 51.4781, lng: -3.1825 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-6",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 6",

        date: "2026-03-12T19:00:00Z",
        startDate: "2026-03-12",
        endDate: "2026-03-12",

        venue: "Motorpoint Arena",
        city: "Nottingham",
        region: "England",
        location: { lat: 52.9548, lng: -1.1351 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-9",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 9",

        date: "2026-04-02T19:00:00Z",
        startDate: "2026-04-02",
        endDate: "2026-04-02",

        venue: "AO Arena",
        city: "Manchester",
        region: "England",
        location: { lat: 53.4881, lng: -2.2446 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-10",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 10",

        date: "2026-04-09T19:00:00Z",
        startDate: "2026-04-09",
        endDate: "2026-04-09",

        venue: "Brighton Centre",
        city: "Brighton",
        region: "England",
        location: { lat: 50.8225, lng: -0.1372 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-12",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 12",

        date: "2026-04-23T19:00:00Z",
        startDate: "2026-04-23",
        endDate: "2026-04-23",

        venue: "M&S Bank Arena",
        city: "Liverpool",
        region: "England",
        location: { lat: 53.3967, lng: -2.9916 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-13",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 13",

        date: "2026-04-30T19:00:00Z",
        startDate: "2026-04-30",
        endDate: "2026-04-30",

        venue: "P&J Live",
        city: "Aberdeen",
        region: "Scotland",
        location: { lat: 57.1660, lng: -2.1570 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-14",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 14",

        date: "2026-05-07T19:00:00Z",
        startDate: "2026-05-07",
        endDate: "2026-05-07",

        venue: "First Direct Arena",
        city: "Leeds",
        region: "England",
        location: { lat: 53.8008, lng: -1.5491 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-night-15",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Night 15",

        date: "2026-05-14T19:00:00Z",
        startDate: "2026-05-14",
        endDate: "2026-05-14",

        venue: "Utilita Arena",
        city: "Birmingham",
        region: "England",
        location: { lat: 52.4794, lng: -1.9130 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "league-night",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-premier-league-2026-finals-night",
        sport: "darts",
        kind: "session",

        title: "Premier League Darts 2026 – Finals Night",

        date: "2026-05-28T19:00:00Z",
        startDate: "2026-05-28",
        endDate: "2026-05-28",

        venue: "The O2",
        city: "London",
        region: "England",
        location: { lat: 51.5030, lng: 0.0032 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/news/2025/10/23/2026-betmgm-premier-league-tickets-general-sale",

        payload: {
          structure: "finals",
          granularity: "session",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-uk-open-2026",
        sport: "darts",
        kind: "session",

        title: "Ladbrokes UK Open 2026",

        date: "2026-03-06T12:00:00Z",
        startDate: "2026-03-06",
        endDate: "2026-03-08",

        venue: "Butlin’s Minehead Resort",
        city: "Minehead",
        region: "England",
        location: { lat: 51.2053, lng: -3.4782 },

        isPaid: true,
        homepageUrl: "https://www.butlins.com/bigweekenders/weekends/pdc-darts-finals",

        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "12:00",
        },
      },

      {
        id: "darts-world-matchplay-2026",
        sport: "darts",
        kind: "session",

        title: "Betfred World Matchplay 2026",

        date: "2026-07-18T19:00:00Z",
        startDate: "2026-07-18",
        endDate: "2026-07-26",

        venue: "Winter Gardens",
        city: "Blackpool",
        region: "England",
        location: { lat: 53.8162, lng: -3.0555 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/tickets",

        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "19:00",
        },
      },

      {
        id: "darts-world-grand-prix-2026",
        sport: "darts",
        kind: "session",

        title: "BoyleSports World Grand Prix 2026",

        date: "2026-09-28T19:00:00Z",
        startDate: "2026-09-28",
        endDate: "2026-10-04",

        venue: "Morningside Arena",
        city: "Leicester",
        region: "England",
        location: { lat: 52.6369, lng: -1.1398 },

        isPaid: true,
        homepageUrl: "https://www.pdc.tv/tickets",

        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "19:00",
        },
      },
    ],
  });
}
