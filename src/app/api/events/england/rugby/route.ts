// src/app/api/events/england/rugby/route.ts

import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseServer";

const sixNationsMatches = [
  {
    id: "6n-2026-ire-ita-0214",
    sport: "rugby",
    kind: "match",
    date: "2026-02-14T14:10:00",
    status: "scheduled",
    competition: "Six Nations 2026 rugby",

    homeTeam: "Ireland",
    awayTeam: "Italy",

    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Ireland_rugby.png",
    awayTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/basketball/nothing.png",

    venue: "Aviva Stadium",
    city: "Dublin",
    region: "Ireland",

    isPaid: true,
    location: { lat: 53.33483165747292, lng: -6.2277814802645235 },

    title: "Ireland vs Italy",
  },
  {
    id: "6n-2026-sco-eng-0214",
    sport: "rugby",
    kind: "match",
    date: "2026-02-14T16:40:00",
    status: "scheduled",
    competition: "Six Nations 2026",

    homeTeam: "Scotland",
    awayTeam: "England",

    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Scotland_rugby.png",
    awayTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Englandrugby.png",

    venue: "Scottish Gas Murrayfield",
    city: "Edinburgh",
    region: "Scotland",

    isPaid: true,
    location: { lat: 55.9428507956809, lng: -3.2406970462593008 },

    title: "Scotland vs England",
  },
  {
    id: "6n-2026-wal-fra-0215",
    sport: "rugby",
    kind: "match",
    date: "2026-02-15T15:10:00",
    status: "scheduled",
    competition: "Six Nations 2026",

    homeTeam: "Wales",
    awayTeam: "France",

    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Wales_rugby.png",
    awayTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/basketball/nothing.png",

    venue: "Principality Stadium",
    city: "Cardiff",
    region: "Wales",

    isPaid: true,
    location: { lat: 51.47913817186764, lng: -3.182699301987622 },

    title: "Wales vs France",
  },

  // 🔥 이하 동일 패턴으로 계속

  {
    id: "6n-2026-eng-ire-0221",
    sport: "rugby",
    kind: "match",
    date: "2026-02-21T14:10:00",
    status: "scheduled",
    competition: "Six Nations 2026",

    homeTeam: "England",
    awayTeam: "Ireland",
    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Englandrugby.png",
    awayTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Ireland_rugby.png",

    venue: "Allianz Stadium",
    city: "London",
    region: "England",
    isPaid: true,
    location: { lat: 51.456847490710814,  lng: -0.3417803221340273 },
    title: "England vs Ireland",
  },

  {
    id: "6n-2026-wal-sco-0221",
    sport: "rugby",
    kind: "match",
    date: "2026-02-21T16:40:00",
    status: "scheduled",
    competition: "Six Nations 2026",

    homeTeam: "Wales",
    awayTeam: "Scotland",

    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Wales_rugby.png",
    awayTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Scotland_rugby.png",
    
    venue: "Principality Stadium",
    city: "Cardiff",
    region: "Wales",
    isPaid: true,
    location: { lat: 51.47913817186764, lng: -3.182699301987622 },
    homepageUrl:
      "https://www.sixnationsrugby.com/en/tickets-and-hospitality",    
    title: "Wales vs Scotland",
  },

  {
    id: "6n-2026-ire-wal-0306",
    sport: "rugby",
    kind: "match",
    date: "2026-03-06T20:10:00",
    status: "scheduled",
    competition: "Six Nations 2026",

    homeTeam: "Ireland",
    awayTeam: "Wales",

    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Ireland_rugby.png",
    awayTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Wales_rugby.png",
    
    venue: "Aviva Stadium",
    city: "Dublin",
    region: "Ireland",
    isPaid: true,
    location: { lat: 53.33483165747292, lng: -6.2277814802645235 },
    homepageUrl:
      "https://www.sixnationsrugby.com/en/tickets-and-hospitality",        
    title: "Ireland vs Wales",
  },

  {
    id: "6n-2026-sco-fra-0307",
    sport: "rugby",
    kind: "match",
    date: "2026-03-07T14:10:00",
    status: "scheduled",
    competition: "Six Nations 2026",

    homeTeam: "Scotland",
    awayTeam: "France",

    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Scotland_rugby.png",
    awayTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/basketball/nothing.png",

    venue: "Scottish Gas Murrayfield",
    city: "Edinburgh",
    region: "Scotland",
    isPaid: true,
    location: { lat: 55.9428507956809, lng: -3.2406970462593008 },
    homepageUrl:
      "https://www.sixnationsrugby.com/en/tickets-and-hospitality",        
    title: "Scotland vs France",
  },

  {
    id: "6n-2026-ire-sco-0314",
    sport: "rugby",
    kind: "match",
    date: "2026-03-14T14:10:00",
    status: "scheduled",
    competition: "Six Nations 2026",

    homeTeam: "Ireland",
    awayTeam: "Scotland",

    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Ireland_rugby.png",
    awayTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Scotland_rugby.png",
    
    venue: "Aviva Stadium",
    city: "Dublin",
    region: "Ireland",
    isPaid: true,
    location: { lat: 53.33483165747292, lng: -6.2277814802645235 },
    homepageUrl:
      "https://www.sixnationsrugby.com/en/tickets-and-hospitality",        
    title: "Ireland vs Scotland",
  },

  {
    id: "6n-2026-wal-ita-0314",
    sport: "rugby",
    kind: "match",
    date: "2026-03-14T16:40:00",
    status: "scheduled",
    competition: "Six Nations 2026",

    homeTeam: "Wales",
    awayTeam: "Italy",

    homeTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/Wales_rugby.png",
    awayTeamLogo:
      "https://bhbsdxxgigzafbroziwi.supabase.co/storage/v1/object/public/logos/basketball/nothing.png",
    
    venue: "Principality Stadium",
    city: "Cardiff",
    region: "Wales",
    isPaid: true,
    location: { lat: 51.47913817186764, lng: -3.182699301987622 },
    homepageUrl:
      "https://www.sixnationsrugby.com/en/tickets-and-hospitality",        
    title: "Wales vs Italy",
  },
];

const cleanTeamName = (name?: string | null) =>
  (name ?? "").replace(/\b(FC|AFC|CF)\b/gi, "").trim();

export async function GET() {
  try {
    const { data: matches, error } = await supabase
      .from("england_rugby_matches")
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
      sport: "rugby",

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

    const mergedEvents = [...formattedMatches, ...sixNationsMatches];

    return NextResponse.json({ matches: mergedEvents });
  } catch (err) {
    console.error("❌ events error:", err);
    return NextResponse.json({ matches: [] });
  }
}
