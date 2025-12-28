// src/app/api/region/[regionSlug]/cities/[citySlug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../../../lib/supabaseServer";

interface RouteParams {
  params: { regionSlug: string; citySlug: string };
}

// 🔹 타입 정의
type Region = {
  name: string;
  slug: string;
};

type CityWithRegion = {
  id: number;
  name: string;
  slug: string;
  region: Region | null;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { regionSlug, citySlug } = params;

  try {
    // ──────────────────────────
    // 1) City + Region 정보
    // ──────────────────────────
    const { data: city, error: cityErr } = await supabase
      .from("cities")
      .select(`
        id,
        name,
        slug,
        region:region_id (
          name,
          slug
        )
      `)
      .eq("slug", citySlug)
      .eq("region.slug", regionSlug)
      .single<CityWithRegion>();

    if (cityErr || !city) {
      if (cityErr) console.error("❌ city error:", cityErr);
      return NextResponse.json({ city: null }, { status: 404 });
    }

    const formattedCity = {
      id: city.id,
      name: city.name,
      slug: city.slug,
      region_name: city.region?.name ?? null,
      region_slug: city.region?.slug ?? null,
    };

    // ──────────────────────────
    // 2) Teams in this city
    // ──────────────────────────
    const { data: teamsRaw, error: teamsErr } = await supabase
      .from("england_pl_football_teams")
      .select("id, name, logo_url")
      .eq("city", city.name);

    if (teamsErr) console.error("❌ teams error:", teamsErr);

    const teams =
      (teamsRaw ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        logo: t.logo_url,
      })) ?? [];

    // ──────────────────────────
    // 3) Events in this city
    // ──────────────────────────
    const { data: eventsRaw, error: eventsErr } = await supabase
      .from("events")
      .select("id, home_team, away_team, date, venue")
      .eq("city", city.name)
      .order("date", { ascending: true });

    if (eventsErr) console.error("❌ events error:", eventsErr);

    return NextResponse.json({
      city: formattedCity,
      teams,
      events: eventsRaw ?? [],
    });
  } catch (err) {
    console.error("❌ [City API Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch city" },
      { status: 500 }
    );
  }
}
