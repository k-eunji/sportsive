// src/app/api/region/[regionSlug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseServer";

interface RouteParams {
  params: { regionSlug: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { regionSlug } = params;

  try {
    const { data: region, error } = await supabase
      .from("regions")
      .select(`
        id,
        name,
        country_code,
        continent,
        slug,
        cities (
          id,
          name,
          slug,
          population
        )
      `)
      .eq("slug", regionSlug)
      .single();

    if (error || !region) {
      if (error?.code !== "PGRST116") {
        console.error("❌ region fetch error:", error);
      }
      return NextResponse.json({ region: null }, { status: 404 });
    }

    return NextResponse.json({
      id: region.id,
      name: region.name,
      countryCode: region.country_code,
      continent: region.continent,
      slug: region.slug,
      cities: region.cities ?? [],
    });
  } catch (err) {
    console.error("❌ [Region API Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch region" },
      { status: 500 }
    );
  }
}
