// src/app/api/events/england/football/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseServer";

const internationalMatches = [
  {
    id: "intl-2026-03-27-eng-uru",
    kind: "match",
    sport: "football",
    competition: "International Match Friendlies",
    status: "scheduled",
    date: "2026-03-27 19:45",

    homeTeam: "England",
    awayTeam: "Uruguay",
    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Flag_of_England.png",
    awayTeamLogo:
      "https://upload.wikimedia.org/wikipedia/en/f/fe/Uruguay_national_football_team_crest.svg",

    venue: "Wembley Stadium",
    city: "London",
    region: "England",
    location: { lat: 51.556663281575105, lng: -0.27953205701577144 },

    isPaid: true,
    teams: ["England", "Uruguay"],
    title: "England vs Uruguay",
    homepageUrl:
      "https://www.englandfootball.com/england/mens-senior-team/fixtures-results",
  },
  {
    id: "intl-2026-03-31-eng-jpn",
    kind: "match",
    sport: "football",
    competition: "International Match Friendlies",
    status: "scheduled",
    date: "2026-03-31 19:45",

    homeTeam: "England",
    awayTeam: "Japan",
    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Flag_of_England.png",
    awayTeamLogo:
      "https://upload.wikimedia.org/wikipedia/en/9/9e/Japan_national_football_team_crest.svg",

    venue: "Wembley Stadium",
    city: "London",
    region: "England",
    location: { lat: 51.556663281575105, lng: -0.27953205701577144 },

    isPaid: true,
    teams: ["England", "Japan"],
    title: "England vs Japan",
    homepageUrl:
      "https://www.englandfootball.com/england/mens-senior-team/fixtures-results",
  },
    {
    id: "fifa-2027q-2026-03-07-eng-isl",
    kind: "match",
    sport: "football",
    competition: "FIFA 2027 World Cup European",
    status: "scheduled",
    date: "2026-03-07 12:30",

    homeTeam: "England W",
    awayTeam: "Iceland W",
    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Flag_of_England.png",
    awayTeamLogo:
      "https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Iceland.svg",

    venue: "The City Ground",
    city: "Nottingham",
    region: "England",
    location: { lat: 52.9401050106301, lng: -1.1329043865910777},

    isPaid: true,
    teams: ["England", "Iceland"],
    title: "England vs Iceland",
    homepageUrl:
      "https://www.englandfootball.com/england/womens-senior-team/fixtures-results",
  },
  {
    id: "fifa-2027q-2026-04-14-eng-esp",
    kind: "match",
    sport: "football",
    competition: "FIFA 2027 World Cup European",
    status: "scheduled",
    date: "2026-04-14 19:00",

    homeTeam: "England W",
    awayTeam: "Spain W",
    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Flag_of_England.png",
    awayTeamLogo:
      "https://upload.wikimedia.org/wikipedia/en/3/32/Spain_national_football_team_crest.svg",

    venue: "Wembley Stadium",
    city: "London",
    region: "England",
    location: { lat: 51.556663281575105, lng: -0.27953205701577144 },

    isPaid: true,
    teams: ["England", "Spain"],
    title: "England vs Spain",
    homepageUrl:
      "https://www.englandfootball.com/england/womens-senior-team/fixtures-results",
  },

];

const cleanTeamName = (name?: string | null) =>
  (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

export async function GET() {
  try {
    const { data: matches, error } = await supabase
      .from("england_pl_football_matches")
      .select(`
        id,
        date,
        status,
        competition,
        sport,
        kind, 
        is_paid,
        home_team_id,
        away_team_id,
        home_team:home_team_id (
          id,
          name,
          logo_url,
          venue,
          lat,
          lng,
          region,
          city,
          homepage_url
        ),
        away_team:away_team_id (
          id,
          name,
          logo_url
        )
      `)
      .order("date", { ascending: true });

    if (error || !matches) {
      console.error(error);
      return NextResponse.json({ matches: [] });
    }

    const formattedMatches = matches.map((m: any) => ({
      id: String(m.id),
      kind: m.kind,
      date: m.date,
      status: m.status,
      competition: m.competition,
      sport: (m.sport || "football").toLowerCase(),

      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,

      homeTeam: cleanTeamName(m.home_team?.name),
      awayTeam: cleanTeamName(m.away_team?.name),
      homeTeamLogo: m.home_team?.logo_url,
      awayTeamLogo: m.away_team?.logo_url,

      venue: m.home_team?.venue,
      location: {
        lat: m.home_team?.lat,
        lng: m.home_team?.lng,
      },
      city: m.home_team?.city,
      region: m.home_team?.region,
      homepageUrl: m.home_team?.homepage_url,

      isPaid: m.is_paid === true,
      teams: [
        cleanTeamName(m.home_team?.name),
        cleanTeamName(m.away_team?.name),
      ],
      title: `${cleanTeamName(m.home_team?.name)} vs ${cleanTeamName(
        m.away_team?.name
      )}`,
    }));

    const allMatches = [
      ...formattedMatches,
      ...internationalMatches,
    ].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ matches: allMatches });
  } catch (err) {
    console.error("❌ events error:", err);
    return NextResponse.json({ matches: [] });
  }
}
