// src/app/api/events/england/fight/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    matches: [
      {
        id: "cwfc-201-2026",
        sport: "fight",
        kind: "match",

        title: "Cage Warriors 201: Ntelis vs Aliu",

        date: "2026-03-13T12:00:00Z",

        venue: "BEC Arena",
        city: "Manchester",
        region: "England",

        location: { lat: 53.469322416116796, lng: -2.331418557628972 },

        isPaid: true,
        homepageUrl: "https://cagewarriors.com/cage-warriors-events/#upcoming",

        payload: {
          discipline: "mma",
          promotion: "cwfc",
          broadcast: "UFC Fight Pass",
          titleFight: false,
          mainEvent: "Ntelis vs Aliu"
        },
      },

      {
        id: "cwfc-202-2026",
        sport: "fight",
        kind: "match",

        title: "Cage Warriors 202: Silva vs Brown",

        date: "2026-03-14T12:00:00Z",

        venue: "BEC Arena",
        city: "Manchester",
        region: "England",

        location: { lat: 53.469322416116796, lng: -2.331418557628972 },

        isPaid: true,
        homepageUrl: "https://cagewarriors.com/cage-warriors-events/#upcoming",

        payload: {
          discipline: "mma",
          promotion: "cwfc",
          broadcast: "UFC Fight Pass",
          titleFight: false,
          mainEvent: "Silva vs Brown"
        },
      },

      {
        id: "mfc-17-2026",
        sport: "fight",
        kind: "match",

        title: "MFC 17",

        date: "2026-03-14T12:00:00Z",

        venue: "Yate Leisure Centre",
        city: "Bristol",
        region: "England",
        location: { lat: 51.540901775222956, lng: -2.4165160846126175 },

        isPaid: true,
        homepageUrl: "https://meltdownmma.com/tickets/",

        payload: {
          discipline: "mma",
          promotion: "mfc",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "caged-steel-42-2026",
        sport: "fight",
        kind: "match",

        title: "Caged Steel 42: Baker vs Arnarson",

        date: "2026-03-14T12:00:00Z",

        venue: "The Dome",
        city: "Doncaster",
        region: "England",
        location: { lat: 53.51572897765677, lng: -1.0992371576234274 },

        isPaid: true,
        homepageUrl: "https://www.caged-steel.co.uk/",

        payload: {
          discipline: "mma",
          promotion: "caged-steel",
          broadcast: null,
          titleFight: false,
          mainEvent: "Baker vs Arnarson"
        },
      },

      {
        id: "shock-awe-40-2026",
        sport: "fight",
        kind: "match",

        title: "Shock n Awe 40",

        date: "2026-03-14T12:00:00Z",

        venue: "Portsmouth Guildhall",
        city: "Portsmouth",
        region: "England",
        location: { lat: 50.79772161622488, lng: -1.0925619576332783 },

        isPaid: true,
        homepageUrl: "https://shocknawe.co.uk/",

        payload: {
          discipline: "mma",
          promotion: "shock-n-awe",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "fusion-fc-45-2026",
        sport: "fight",
        kind: "match",

        title: "Fusion FC 45",

        date: "2026-03-14T12:00:00Z",

        venue: "Epsom Downs Racecourse",
        city: "Epsom",
        region: "England",

        location: { lat: 51.31340966065867, lng: -0.25454318648174945 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/fusionfightingmma/",

        payload: {
          discipline: "mma",
          promotion: "ffc",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "virtus-mma-5-2026",
        sport: "fight",
        kind: "match",

        title: "Virtus MMA 5",

        date: "2026-03-14T13:00:00Z",

        venue: "Healy Park",
        city: "Omagh",
        region: "Northern Ireland",
        location: { lat: 54.61399996439087, lng: -7.296967671129306 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/virtusmma/",

        payload: {
          discipline: "mma",
          promotion: "virtus",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "dickens-cacace-2026",
        sport: "fight",
        kind: "match",

        title: "Dickens vs Cacace",

        date: "2026-03-14T14:00:00Z",
        venue: "3Arena",
        city: "Dublin",
        region: "Ireland",

        location: { lat: 53.34762439359439, lng: -6.228464884616938 },

        isPaid: true,
        homepageUrl: "https://queensberry.co.uk",

        payload: {
          discipline: "boxing",
          promotion: "queensberry",
          broadcast: "DAZN",
          titleFight: true,
          mainEvent: "Dickens vs Cacace"
        },
      },
      {
        id: "bkfc-fight-night-newcastle-2026",
        sport: "fight",
        kind: "match",

        title: "BKFC Fight Night: Terrill vs McFarlane",

        date: "2026-03-14T14:00:00Z",

        venue: "Utilita Arena",
        city: "Newcastle",
        region: "England",

        location: { lat: 54.96403556468035, lng: -1.6230382134652097 },

        isPaid: true,
        homepageUrl: "https://www.bkfc.com",

        payload: {
          discipline: "bareknuckle",
          promotion: "bkfc",
          broadcast: "TrillerTV",
          titleFight: true,
          title: "Heavyweight Title",
          mainEvent: "Terrill vs McFarlane"
        },
      },

      {
        id: "undeniable-fight-night-3-2026",
        sport: "fight",
        kind: "match",

        title: "Undeniable Fight Night 3",

        date: "2026-03-14T14:00:00Z",

        venue: "Hangar 34",
        city: "Liverpool",
        region: "England",

        location: { lat: 53.39529143302547, lng: -2.978800040442292 },

        isPaid: true,
        homepageUrl: "https://www.facebook.com/people/Hybrid-Boxing-Organisation/61578558698863/",
     
        payload: {
          discipline: "boxing",
          promotion: "hbo",
          broadcast: "Internet PPV",
          titleFight: true,
          title: "Title Fight",
          mainEvent: "Reid vs Rawlinson"
        },
      },

      {
        id: "warlords-5-2026",
        sport: "fight",
        kind: "match",

        title: "Warlords 5",

        date: "2026-03-14T20:00:00Z",

        venue: " Blake Hall",
        city: "Bridgwater",
        region: "England",

        location: { lat: 51.126819801688214, lng: -3.0015861557969186 },

        isPaid: true,
        homepageUrl: "https://warlordspromotions.co.uk/",

        payload: {
          discipline: "boxing",
          promotion: "wp",
          titleFight: true,
          title: "Title Fight",
          mainEvent: "Prurzynski vs Derry"
        },
      },

      {
        id: "cwfc-203-2026",
        sport: "fight",
        kind: "match",

        title: "Cage Warriors 203: Leblond vs Scott",

        date: "2026-03-20T12:00:00Z",

        venue: "Indigo at The O2",
        city: "London",
        region: "England",

        location: { lat: 51.502777219940256, lng: 0.005219844217481553 },

        isPaid: true,
        homepageUrl: "https://cagewarriors.com",

        payload: {
          discipline: "mma",
          promotion: "cwfc",
          broadcast: "UFC Fight Pass",
          titleFight: true,
          title: "Flyweight Title",
          mainEvent: "Leblond vs Scott"
        },
      },

      {
        id: "conlan-walsh-2026",
        sport: "fight",
        kind: "match",

        title: "Conlan vs Walsh",

        date: "2026-03-20T14:00:00Z",

        venue: "SSE Arena",
        city: "Belfast",
        region: "Northern Ireland",

        location: { lat: 54.60378593224596, lng: -5.914174355791819 },

        isPaid: true,
        homepageUrl: "https://www.dazn.com",

        payload: {
          discipline: "boxing",
          promotion: "matchroom",
          broadcast: "DAZN",
          mainEvent: "Conlan vs Walsh"
        },
      },

      {
        id: "raged-uk-24-2026",
        sport: "fight",
        kind: "match",

        title: "Raged UK 24",

        date: "2026-03-21T12:00:00Z",

        venue: "Swindon Arena",
        city: "Swindon",
        region: "England",

        location: { lat: 51.55881026698001, lng: -1.7805492576469666 },

        isPaid: true,
        homepageUrl: "https://www.raged.uk/",

        payload: {
          discipline: "mma",
          promotion: "ruk"
        },
      },

      {
        id: "ufc-fight-night-evloev-murphy-2026",
        sport: "fight",
        kind: "match",

        title: "UFC Fight Night: Evloev vs Murphy",

        date: "2026-03-21T13:00:00Z",

        venue: "The O2",
        city: "London",
        region: "England",

        location: { lat: 51.50342683042948, lng: 0.0031372926289739127 },

        isPaid: true,
        homepageUrl: "https://www.ufc.com",

        payload: {
          discipline: "mma",
          promotion: "ufc",
          broadcast: "Paramount+",
          titleFight: false,
          weightClass: "145 lbs",
          mainEvent: "Evloev vs Murphy"
        },
      },

      {
        id: "liddard-denny-2026",
        sport: "fight",
        kind: "match",

        title: "Liddard vs Denny",

        date: "2026-03-21T14:00:00Z",

        venue: "Copper Box Arena",
        city: "London",
        region: "England",

        location: { lat: 51.54440715769663, lng: -0.019850784625686683 },

        isPaid: true,
        homepageUrl: "https://www.dazn.com",

        payload: {
          discipline: "boxing",
          promotion: "matchroom",
          broadcast: "DAZN",
          titleFight: true,
          mainEvent: "Liddard vs Denny"
        },
      },

      {
        id: "rise-and-conquer-19-2026",
        sport: "fight",
        kind: "match",

        title: "Rise and Conquer 19",

        date: "2026-03-28T12:00:00Z",

        venue: "Sunderland Live Arena",
        city: "Sunderland",
        region: "England",

        location: { lat: 54.8330316498061, lng: -1.4795206422793974 },

        isPaid: true,
        homepageUrl: "https://www.facebook.com/Riseandconquerfightshow/",

        payload: {
          discipline: "mma",
          promotion: "rac",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "sfc-8-2026",
        sport: "fight",
        kind: "match",

        title: "SFC 8: Herczeg vs Mullen",

        date: "2026-03-28T12:00:00Z",

        venue: "Ebbw Vale Sports Centre",
        city: "Ebbw Vale",
        region: "Wales",

        location: { lat: 51.77398187956634, lng: -3.2031854441573318 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/sfc_wales/",

        payload: {
          discipline: "mma",
          promotion: "sfc",
          broadcast: null,
          titleFight: true,
          weightClass: "Bantamweight",
          mainEvent: "Herczeg vs Mullen"
        },
      },

      {
        id: "caf-contender-series-2026",
        sport: "fight",
        kind: "match",

        title: "CAF Contender Series",

        date: "2026-03-28T12:00:00Z",

        venue: "Boxpark Liverpool",
        city: "Liverpool",
        region: "England",

        location: { lat: 53.394049954057394, lng: -2.9783629521257144 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/cafcontenderseries/",

        payload: {
          discipline: "mma",
          promotion: "caf",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "bmf-16-2026",
        sport: "fight",
        kind: "match",

        title: "BMF 16: Morrow vs Barnett",

        date: "2026-03-28T12:00:00Z",

        venue: "Barnsley Metrodome",
        city: "Barnsley",
        region: "England",

        location: { lat: 53.554525371105626, lng: -1.4706622404488525 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/bmfmmauk/",

        payload: {
          discipline: "mma",
          promotion: "bmf",
          broadcast: null,
          titleFight: true,
          weightClass: "155 lbs",
          mainEvent: "Morrow vs Barnett"
        },
      },

      {
        id: "itauma-franklin-2026",
        sport: "fight",
        kind: "match",

        title: "Itauma vs Franklin",

        date: "2026-03-28T14:00:00Z",

        venue: "Co-OP LIVE Arena",
        city: "Manchester",
        region: "England",

        location: { lat: 53.486364844015554, lng: -2.1999823441507695 },

        isPaid: true,
        homepageUrl: "https://queensberry.co.uk",

        payload: {
          discipline: "boxing",
          promotion: "queensberry",
          broadcast: "DAZN",
          titleFight: true,
          mainEvent: "Itauma vs Franklin"
        },
      },

      {
        id: "brown-ducar-2026",
        sport: "fight",
        kind: "match",

        title: "Brown vs Ducar",

        date: "2026-04-03T12:00:00Z",

        venue: "Planet Ice",
        city: "Altrincham",
        region: "England",

        location: { lat: 53.38667989342036, lng: -2.346991572969186 },

        isPaid: true,
        homepageUrl: "https://www.matchroomboxing.com/",

        payload: {
          discipline: "boxing",
          promotion: "matchroom",
          broadcast: "DAZN",
          titleFight: false,
          mainEvent: "Brown vs Ducar"
        },
      },

      {
        id: "battle-arena-86-2026",
        sport: "fight",
        kind: "match",

        title: "Battle Arena 86",

        date: "2026-04-04T11:00:00Z",

        venue: "The New Bingley Halla",
        city: "Birmingham",
        region: "England",

        location: { lat:52.49529699600479, lng: -1.917335665579348 },

        isPaid: true,
        homepageUrl: "https://mmabattlearena.com/",

        payload: {
          discipline: "mma",
          promotion: "ba",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "price-aquino-2026",
        sport: "fight",
        kind: "match",

        title: "Price vs Aquino",

        date: "2026-04-04T12:00:00Z",

        venue: "Utilita Arena",
        city: "Cardiff",
        region: "Wales",

        location: { lat: 54.96403556468035, lng: -1.6230382134652097 },

        isPaid: true,
        homepageUrl: "https://www.boxxer.com/",

        payload: {
          discipline: "boxing",
          promotion: "ub",
          broadcast: "DAZN",
          titleFight: true,
          mainEvent: "Price vs Pineiro"
        },
      },

      {
        id: "chisora-wilder-2026",
        sport: "fight",
        kind: "match",

        title: "Chisora vs Wilder",

        date: "2026-04-04T12:00:00Z",

        venue: "O2 Arena",
        city: "London",
        region: "England",

        location: { lat: 51.5033066198645, lng: 0.0031587503255051806 },

        isPaid: true,
        homepageUrl: "https://misfitsinc.shop/",

        payload: {
          discipline: "boxing",
          promotion: "matchroom",
          broadcast: "DAZN",
          titleFight: true,
          mainEvent: "Chisora vs Wilder"
        },
      },

      {
        id: "oran-mor-fight-night-15-2026",
        sport: "fight",
        kind: "match",

        title: "Oran Mor Fight Night 15",

        date: "2026-04-05T11:00:00Z",

        venue: "Oran Mor",
        city: "Glasgow",
        region: "Scotland",

        location: { lat: 55.87764755866671, lng: -4.28972751346793 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/oranmor_fightshows/",

        payload: {
          discipline: "mma",
          promotion: "sfs",
          broadcast: null,
          mainEvent: "Boston Dave v John Cullen",
          titleFight: false
        },
      },

      {
        id: "dubois-harper-2026",
        sport: "fight",
        kind: "match",

        title: "Dubois vs Harper",

        date: "2026-04-05T12:00:00Z",

        venue: "Olympia",
        city: "London",
        region: "England",

        location: { lat: 51.496503546368956, lng: -0.21078515764587183 },

        isPaid: true,
        homepageUrl: "https://boxrec.com/en/event/943237",

        payload: {
          discipline: "boxing",
          promotion: "mvp",
          broadcast: null,
          titleFight: true,
          mainEvent: "Dubois vs Harper"
        },
      },

      {
        id: "impact-bkb-3-2026",
        sport: "fight",
        kind: "match",

        title: "Impact BKB 3",

        date: "2026-04-11T11:00:00Z",

        venue: "Crowne Plaza",
        city: "Glasgow",
        region: "Scotland",

        location: { lat: 55.85989330337644, lng: -4.2897240864777375 },

        isPaid: true,
        homepageUrl: "https://impactbkb.co.uk/",

        payload: {
          discipline: "bareknuckle",
          promotion: "ibkb",
          broadcast: null,
          titleFight: true,
          mainEvent: "Boyle vs Witkowski"
        },
      },

      {
        id: "uwc-deus-vult-2026",
        sport: "fight",
        kind: "match",

        title: "UWC: Deus Vult",

        date: "2026-04-11T10:30:00Z",

        venue: "Clements Hall Leisure Centre",
        city: "Hawkwell",
        region: "England",

        location: { lat: 51.594885139219876, lng: 0.6720505288606665 },

        isPaid: true,
        homepageUrl: "https://uwcmma.co.uk/",

        payload: {
          discipline: "mma",
          promotion: "uwc",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "nrg-fight-night-2026",
        sport: "fight",
        kind: "match",

        title: "NRG Fight Night",

        date: "2026-04-11T11:00:00Z",

        venue: "The Hamworthy Club",
        city: "Bournemouth",
        region: "England",

        location: { lat: 50.77963852288389, lng: -1.9489808134632043 },

        isPaid: true,
        homepageUrl: "https://www.nrgboxing.co.uk/nrg-fight-nights/",

        payload: {
          discipline: "mma",
          promotion: "nrg",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "fury-makhmudov-2026",
        sport: "fight",
        kind: "match",

        title: "Fury vs Makhmudov",

        date: "2026-04-11T13:00:00Z",

        venue: "Tottenham Hotspur Stadium",
        city: "London",
        region: "England",

        location: { lat: 51.603279819887234, lng: -0.06570537907991889 },

        isPaid: true,
        homepageUrl: "https://boxrec.com/en/event/942814",

        payload: {
          discipline: "boxing",
          promotion: "pfl",
          broadcast: "Netflix",
          titleFight: true,
          mainEvent: "Fury vs Makhmudov"
        },
      },

      {
        id: "pfl-belfast-2026",
        sport: "fight",
        kind: "match",

        title: "PFL Belfast: Hughes vs Wilson",

        date: "2026-04-16T13:30:00Z",

        venue: "SSE Arena",
        city: "Belfast",
        region: "Northern Ireland",

        location: { lat: 54.60378593224596, lng: -5.914174355791819 },

        isPaid: true,
        homepageUrl: "https://pflmma.com",

        payload: {
          discipline: "mma",
          promotion: "pfl",
          broadcast: null,
          titleFight: false,
          weightClass: "155 lbs",
          mainEvent: "Hughes vs Wilson"
        },
      },

      {
        id: "collins-lorente-2-2026",
        sport: "fight",
        kind: "match",

        title: "Collins vs Lorente II",

        date: "2026-04-17T12:00:00Z",

        venue: "OVO Hydro",
        city: "Glasgow",
        region: "Scotland",

        location: { lat: 55.859692955098396, lng: -4.285576271139696 },

        isPaid: true,
        homepageUrl: "https://queensberry.co.uk",

        payload: {
          discipline: "boxing",
          promotion: "queensberry",
          broadcast: "DAZN",
          titleFight: true,
          mainEvent: "Collins vs Lorente II"
        },
      },

      {
        id: "smith-morrell-2026",
        sport: "fight",
        kind: "match",

        title: "Smith vs Morrell",

        date: "2026-04-18T13:00:00Z",

        venue: "M&S Bank Arena",
        city: "Liverpool",
        region: "England",

        location: { lat: 53.39761344052548, lng: -2.9915711422976248 },

        isPaid: true,
        homepageUrl: "https://www.matchroomboxing.com/",

        payload: {
          discipline: "boxing",
          promotion: "matchroom",
          broadcast: "DAZN",
          titleFight: true,
          mainEvent: "Smith vs Morrell"
        },
      },

      {
        id: "cwfc-205-2026",
        sport: "fight",
        kind: "match",

        title: "Cage Warriors 205: Burlinson vs Clancy Jr",

        date: "2026-04-25T11:00:00Z",

        venue: "Braehead Arena",
        city: "Glasgow",
        region: "Scotland",

        location: { lat: 55.87678113501081, lng: -4.364956072984456 },

        isPaid: true,
        homepageUrl: "https://cagewarriors.com",

        payload: {
          discipline: "mma",
          promotion: "cwfc",
          broadcast: "UFC Fight Pass",
          titleFight: true,
          weightClass: "Welterweight",
          mainEvent: "Burlinson vs Clancy Jr"
        },
      },

      {
        id: "walker-eggington-2026",
        sport: "fight",
        kind: "match",

        title: "Walker vs Eggington",

        date: "2026-05-02T13:00:00Z",

        venue: "Utilita Arena Birmingham",//다시 체크
        city: "Birmingham",
        region: "England",

        location: { lat: 52.48172839728678, lng: -1.9154679142998055 },

        isPaid: true,
        homepageUrl: "https://www.matchroomboxing.com/",

        payload: {
          discipline: "boxing",
          promotion: "matchroom",
          broadcast: "DAZN",
          titleFight: false,
          mainEvent: "Walker vs Eggington"
        },
      },

      {
        id: "al-ghena-townsend-2026",
        sport: "fight",
        kind: "match",

        title: "Al-Ghena vs Townsend",

        date: "2026-05-03T12:00:00Z",

        venue: "York Hall",
        city: "London",
        region: "England",

        location: { lat: 51.52973849602211, lng: -0.055235542302696714 },

        isPaid: true,
        homepageUrl: "https://boxrec.com/en/event/943916",

        payload: {
          discipline: "boxing",
          promotion: "ttb",
          broadcast: "DAZN",
          titleFight: true,
          mainEvent: "Al-Ghena vs Townsend"
        },
      },

      {
        id: "golden-ticket-fight-promo-2026",
        sport: "fight",
        kind: "match",

        title: "Golden Ticket Fight Promotions",

        date: "2026-05-09T11:00:00Z",

        venue: "KK's Steel Mill",
        city: "Wolverhampton",
        region: "England",

        location: { lat: 52.57906743465456, lng: -2.1283996711293085 },

        isPaid: true,
        homepageUrl: "https://goldenticketfightpromotions.com/",

        payload: {
          discipline: "mma",
          promotion: "gtfpl",
          broadcast: null,
          titleFight: true,
          weightClass: "115 lbs",
          mainEvent: "Payne vs Ní Nualláin"
        },
      },

      {
        id: "elite-fighting-championships-2026",
        sport: "fight",
        kind: "match",

        title: "Elite Fighting Championships",

        date: "2026-05-09T11:00:00Z",

        venue: "Blackrock National Hurling Club",//다시 체크
        city: "Cork",
        region: "Ireland",

        location: { lat: 51.892701507931726, lng: -8.419160744148028 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/elitefightingchampionship_cork/",

        payload: {
          discipline: "mma",
          promotion: "efc",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "wardley-dubois-2026",
        sport: "fight",
        kind: "match",

        title: "Wardley vs Dubois",

        date: "2026-05-09T13:00:00Z",

        venue: "Co-OP LIVE Arena",
        city: "Manchester",
        region: "England",

        location: { lat: 53.486364844015554, lng: -2.1999823441507695 },

        isPaid: true,
        homepageUrl: "https://queensberry.co.uk",

        payload: {
          discipline: "boxing",
          promotion: "queensberry",
          broadcast: "DAZN",
          titleFight: true,
          weightClass: "Heavyweight",
          mainEvent: "Wardley vs Dubois"
        },
      },

      {
        id: "xfc-10-2026",
        sport: "fight",
        kind: "match",

        title: "XFC 10",

        date: "2026-05-16T11:00:00Z",

        venue: "WAX Gym",
        city: "Cornwall",
        region: "England",

        location: { lat: 50.41553191471374, lng: -5.061375299981225 },

        isPaid: true,
        homepageUrl: "https://xfc.world/",

        payload: {
          discipline: "mma",
          promotion: "xfc",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "octagon-wars-7-2026",
        sport: "fight",
        kind: "match",

        title: "Octagon Wars 7",

        date: "2026-05-23T11:00:00Z",

        venue: "Deeside Leisure Centre",
        city: "Deeside",
        region: "Wales",

        location: { lat: 53.207982212770645, lng: -3.0274837153256464 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/octagonwars/",

        payload: {
          discipline: "mma",
          promotion: "ow",
          broadcast: null,
          titleFight: true,
          mainEvent: "Jones vs Donaghey"
        },
      },

      {
        id: "iur-fighting-championships-2026",
        sport: "fight",
        kind: "match",

        title: "IÚR Fighting Championships",

        date: "2026-05-24T12:00:00Z",

        venue: " Canal Court Hotel & Spa.",
        city: "Newry",
        region: "Northern Ireland",

        location: { lat: 54.176186454438536, lng: -6.340095409760923 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/iur_fighting_championship_/",

        payload: {
          discipline: "mma",
          promotion: "iur",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "budo-fighting-championships-2026",
        sport: "fight",
        kind: "match",

        title: "Budo Fighting Championships",

        date: "2026-05-30T11:00:00Z",

        venue: "Neath Sports Centre",
        city: "Neath",
        region: "Wales",

        location: { lat: 51.66513147368093, lng: -3.816919502414561 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/budofightchamps/",

        payload: {
          discipline: "mma",
          promotion: "bfc",
          broadcast: null,
          titleFight: false
        },
      },
      {
        id: "sfc-9-2026",
        sport: "fight",
        kind: "match",

        title: "SFC 9",

        date: "2026-06-27T11:00:00Z",

        venue: "Ebbw Vale Sports Centre",
        city: "Ebbw Vale",
        region: "Wales",

        location: { lat: 51.77398187956634, lng: -3.2031854441573318 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/sfc_wales/",

        payload: {
          discipline: "mma",
          promotion: "sfc",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "mfc-18-2026",
        sport: "fight",
        kind: "match",

        title: "MFC 18",

        date: "2026-07-04T11:00:00Z",

        venue: "Yate Leisure Centre",
        city: "Bristol",
        region: "England",

        location: { lat: 51.540901775222956, lng: -2.4165160846126175 },

        isPaid: true,
        homepageUrl: "https://meltdownmma.com/",

        payload: {
          discipline: "mma",
          promotion: "mfc",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "elite-fighting-championships-july-2026",
        sport: "fight",
        kind: "match",

        title: "Elite Fighting Championships",

        date: "2026-07-25T12:00:00Z",

        venue: "Blackrock National Hurling Club",//다시 체크
        city: "Cork",
        region: "Ireland",

        location: { lat: 51.892701507931726, lng: -8.419160744148028 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/elitefightingchampionship_cork/",

        payload: {
          discipline: "mma",
          promotion: "efc",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "budo-fighting-championships-sep-2026",
        sport: "fight",
        kind: "match",

        title: "Budo Fighting Championships",

        date: "2026-09-05T11:00:00Z",

        venue: "Neath Sports Centre",
        city: "Neath",
        region: "Wales",

        location: { lat: 51.66513147368093, lng: -3.816919502414561 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/budofightchamps/",

        payload: {
          discipline: "mma",
          promotion: "bfc",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "sfc-10-2026",
        sport: "fight",
        kind: "match",

        title: "SFC 10",

        date: "2026-09-26T11:00:00Z",

        venue: "Ebbw Vale Sports Centre",
        city: "Ebbw Vale",
        region: "Wales",

        location: { lat: 51.77398187956634, lng: -3.2031854441573318 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/sfc_wales/",

        payload: {
          discipline: "mma",
          promotion: "sfc",
          broadcast: null,
          titleFight: false
        },
      },

      {
        id: "elite-fighting-championships-nov-2026",
        sport: "fight",
        kind: "match",

        title: "Elite Fighting Championships",

        date: "2026-11-14T12:00:00Z",

        venue: "Blackrock National Hurling Club",//다시 체크
        city: "Cork",
        region: "Ireland",

        location: { lat: 51.892701507931726, lng: -8.419160744148028 },

        isPaid: true,
        homepageUrl: "https://www.instagram.com/elitefightingchampionship_cork/",

        payload: {
          discipline: "mma",
          promotion: "efc",
          broadcast: null,
          titleFight: false
        },
      },
    ],
  });
}