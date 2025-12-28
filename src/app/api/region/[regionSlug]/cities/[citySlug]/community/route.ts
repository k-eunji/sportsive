// src/app/api/region/[regionSlug]/cities/[citySlug]/community/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../../../../lib/supabaseServer";

interface RouteParams {
  params: { regionSlug: string; citySlug: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { regionSlug, citySlug } = params;

  try {
    const { data: posts, error } = await supabase
      .from("community_posts")
      .select(`
        id,
        user,
        text,
        likes,
        created_at
      `)
      .eq("region_slug", regionSlug)
      .eq("city_slug", citySlug)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ community_posts error:", error);
      return NextResponse.json({ posts: [] });
    }

    return NextResponse.json({ posts: posts ?? [] });
  } catch (err) {
    console.error("❌ [Community API Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch community posts" },
      { status: 500 }
    );
  }
}
