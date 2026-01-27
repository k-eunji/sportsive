//src/app/api/log/visit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_id, is_within_first_24h, entry_reason } = body;

    if (
      !client_id ||
      typeof is_within_first_24h !== "boolean" ||
      typeof entry_reason !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("visit_logs")
      .insert({
        client_id,
        is_within_first_24h,
        entry_reason,
        visited_at: new Date().toISOString(),
      });

    if (error) {
      console.error("visit_logs insert error", error);
      return NextResponse.json(
        { error: "DB error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("visit log error", e);
    return NextResponse.json(
      { error: "Bad request" },
      { status: 400 }
    );
  }
}
