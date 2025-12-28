// src/app/api/region/[regionSlug]/cities/[citySlug]/events/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../../../../lib/supabaseServer";

interface RouteParams {
  params: { regionSlug: string; citySlug: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { regionSlug, citySlug } = params;

  try {
    const { data: events, error } = await supabase
      .from("events")
      .select(`
        id,
        home_team,
        away_team,
        date,
        venue,
        is_free
      `)
      .eq("region_slug", regionSlug)
      .eq("city_slug", citySlug)
      .order("date", { ascending: true });

    if (error) {
      console.error("❌ city events error:", error);
      return NextResponse.json({ events: [] });
    }

    return NextResponse.json({ events: events ?? [] });
  } catch (err) {
    console.error("❌ [City Events API Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
