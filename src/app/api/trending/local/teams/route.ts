// src/app/api/trending/local/teams/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabaseServer";

function clean(str: string | null | undefined) {
  return (str ?? "")
    .replace(/\b(FC|AFC|CF)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .toLowerCase();
}

interface Team {
  id: string;
  name: string;
  logo: string | null;
  city: string;
}

export async function GET(req: NextRequest) {
  const city = clean(req.nextUrl.searchParams.get("city"));
  if (!city) {
    return NextResponse.json([], { status: 400 });
  }

  try {
    const { data: rawTeams, error } = await supabase
      .from("england_pl_football_teams")
      .select("id, name, city, logo_url")
      .eq("city", city);

    if (error) {
      console.error("❌ supabase teams error:", error);
      return NextResponse.json([], { status: 500 });
    }

    const teams: Team[] = (rawTeams ?? []).map((t: any) => ({
      id: String(t.id),
      name: t.name,
      logo: t.logo_url ?? null,
      city: clean(t.city),
    }));

    return NextResponse.json(teams);
  } catch (err) {
    console.error("❌ Local trending teams error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
