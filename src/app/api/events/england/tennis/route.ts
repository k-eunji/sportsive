// src/app/api/events/england/tennis/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    matches: [
      {
        id: "tennis-glasgow-challenger-2026",
        sport: "tennis",
        kind: "session",

        title: "ATP Lexus Glasgow Challenger",

        date: "2026-0-12T11:00:00Z",
        startDate: "2026-01-12",
        endDate: "2026-01-17",

        venue: "Scotstoun Leisure centre",
        city: "Glasgow",
        region: "Scotland",

        location: { lat: 55.88142763995173, lng: -4.339822013473594 },

        isPaid: true,
        homepageUrl: "https://www.lta.org.uk",

        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "11:00",
        },
      },  
      {
        id: "tennis-birmingham-open-centre-court-2026",
        sport: "tennis",
        kind: "session",
        title: "Lexus Birmingham Open Centre Court 2026",
        date: "2026-06-01T10:00:00Z",
        startDate: "2026-06-01",
        endDate: "2026-06-07",
        venue: "Edgbaston Priory Club",
        city: "Birmingham",
        region: "England",
        location: { lat: 52.45902734792112, lng: -1.9126484864791973 },
        isPaid: true,
        homepageUrl: "https://tickets.lta.org.uk/selection/event/date?productId=10229142012992&gtmStepTracking=true",
        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "10:00",
        },
      },

      {
        id: "tennis-ilkley-trophy-2026",
        sport: "tennis",
        kind: "session",
        title: "Lexus Ilkley Trophy 2026",
        date: "2026-06-09T10:00:00Z",
        startDate: "2026-06-09",
        endDate: "2026-06-14",
        venue: "Ilkley Lawn Tennis & Squash Club",
        city: "Ilkley",
        region: "England",
        location: { lat: 53.93071274884015, lng: -1.837521093972053 },
        isPaid: true,
        homepageUrl: "https://tickets.lta.org.uk/selection/event/date?productId=10229166522163&gtmStepTracking=true",
        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "10:00",
        },
      },

      {
        id: "tennis-queens-wta-2026",
        sport: "tennis",
        kind: "session",

        title: "HSBC Championships – WTA 500 2026",

        date: "2026-06-08T10:00:00Z",
        startDate: "2026-06-08",
        endDate: "2026-06-14",

        venue: "Queen’s Club",
        city: "London",
        region: "England",

        location: { lat: 51.48690614473145, lng: -0.21219290804584984 },

        isPaid: true,
        homepageUrl: "https://tickets.lta.org.uk/selection/event/date?productId=10229096069964&gtmStepTracking=true",

        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "10:00",
        },
      },
      {
        id: "tennis-queens-atp-2026",
        sport: "tennis",
        kind: "session",

        title: "HSBC Championships – ATP 500 2026",

        date: "2026-06-15T10:00:00Z",
        startDate: "2026-06-15",
        endDate: "2026-06-21",

        venue: "Queen’s Club",
        city: "London",
        region: "England",

        location: { lat: 51.48690614473145, lng: -0.21219290804584984 },

        isPaid: true,
        homepageUrl: "https://tickets.lta.org.uk/content?utm_source=hsbc_ticketing_page&utm_medium=referral&utm_campaign=hsbc2026_november&_gl=1*g0th1o*_gcl_au*NDUzMzA5NDY2LjE3Njc2MDk4Nzg.*_ga*MTc5OTc1OTk4OC4xNzY3NjA5ODc5*_ga_R8CDFT1V4H*czE3NzI5ODIyNDAkbzMkZzEkdDE3NzI5ODMwMDkkajYwJGwwJGgw",

        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "10:00",
        },
      },  
      {
        id: "tennis-birmingham-classic-2026",
        sport: "tennis",
        kind: "session",
        title: "Birmingham Classic 2026",
        date: "2026-06-15T11:00:00Z",
        startDate: "2026-06-15",
        endDate: "2026-06-21",
        venue: "Edgbaston Priory Club",
        city: "Birmingham",
        region: "England",
        location: { lat: 52.4551, lng: -1.9313 },
        isPaid: true,
        homepageUrl: "https://www.lta.org.uk/fan-zone/birmingham-classic/",
        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "11:00",
        },
      },

      {
        id: "tennis-nottingham-open-2026",
        sport: "tennis",
        kind: "session",
        title: "Lexus Nottingham Open 2026",
        date: "2026-06-13T10:00:00Z",
        startDate: "2026-06-13",
        endDate: "2026-06-21",
        venue: "Nottingham Tennis Centre",
        city: "Nottingham",
        region: "England",
        location: { lat: 52.93506907012659, lng: -1.1904778760183983 },
        isPaid: true,
        homepageUrl: "https://tickets.lta.org.uk/selection/event/date?productId=10229163583969&gtmStepTracking=true",
        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "1:00",
        },
      },

      {
        id: "tennis-eastbourne-open-2026",
        sport: "tennis",
        kind: "session",
        title: "Lexus Eastbourne Open 2026",
        date: "2026-06-22T10:00:00Z",
        startDate: "2026-06-22",
        endDate: "2026-06-27",
        venue: "Devonshire Park",
        city: "Eastbourne",
        region: "England",
        location: { lat: 50.76487498859795, lng: 0.28288379236726774 },
        isPaid: true,
        homepageUrl: "https://tickets.lta.org.uk/selection/event/date?productId=10229155622843&gtmStepTracking=true",
        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "10:00",
        },
      },
      {
        id: "british-open-roehampton-2026",
        sport: "tennis",
        kind: "session",
        title: "Lexus British Open Roehampton 2026",
        date: "2026-06-28T10:00:00Z",
        startDate: "2026-06-28",
        endDate: "2026-07-03",
        venue: "Wimbledon Qualifying and Community Sports Centre",
        city: "London",
        region: "England",
        location: { lat: 51.458209310285625, lng: -0.254804029709546 },
        isPaid: true,
        homepageUrl: "https://tickets.lta.org.uk/selection/event/date?productId=10229167730726&gtmStepTracking=true",
        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "10:00",
        },
      },

      {
        id: "tennis-wimbledon-2026",
        sport: "tennis",
        kind: "session",
        title: "The Championships, Wimbledon 2026",
        date: "2026-06-29T10:00:00Z",
        startDate: "2026-06-29",
        endDate: "2026-07-12",
        venue: "All England Lawn Tennis Club",
        city: "London",
        region: "England",
        location: { lat: 51.43447166058049, lng: -0.2144239300899227 },
        isPaid: true,
        homepageUrl: "https://wimbledondebentureowners.com/?utm_source=bing&utm_medium=cpc&utm_campaign=Wimbledon%20Debentures&hsa_acc=6122828684&hsa_cam=12282362147&hsa_grp=1209463292865874&hsa_ad&hsa_src=o&hsa_tgt=kwd-77790910633067%3Aloc-188&hsa_kw=wimbledon%20debenture%20holders&hsa_mt=b&hsa_net=adwords&hsa_ver=3&msclkid=2c7253053c9f193980d33aa8a948c5f7&utm_term=wimbledon%20debenture%20holders&utm_content=Wimbledon%202021",
        payload: {
          structure: "tournament",
          granularity: "day",
          typicalStartTime: "10:00",
        },
      },
      {
        id: "tennis-laver-cup-2026",
        sport: "tennis",
        kind: "session",

        title: "Laver Cup 2026",

        date: "2026-09-25T12:00:00Z",
        startDate: "2026-09-25",
        endDate: "2026-09-27",

        venue: "The O2 Arena",
        city: "London",
        region: "England",

        location: { lat: 51.50329326311515, lng: 0.003180207983784033 },

        isPaid: true,
        homepageUrl: "https://lavercup.com/tickets",

        payload: {
          structure: "team-event",
          granularity: "session",
          typicalStartTime: "12:00",
        },
      }
    ],
  });
}