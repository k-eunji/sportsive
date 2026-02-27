///src/app/api/log/map-switch/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

const BLOCKED_CLIENT_IDS = new Set([
  "a0b742ff-29a8-468c-af58-181333f0da9f",
  "04eb6a07-6b9b-45ae-96bd-dd38dfd73058",
  "d6e6c5d9-1bd2-42ca-9fbd-33ce800e22ae",
  "695f06f3-5ea4-47d5-aa56-5a3a6fa4da49",
  "52fd7db7-0a7f-4cf3-8bf4-56b6ce2c4122",
  "70f78632-006c-4c8e-bc21-16c3b9ca22b9",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_id, pathname, referrer, source } = body;
    const country =
      req.headers.get("x-vercel-ip-country") ?? "unknown";

    const ip =
      req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const user_agent =
      req.headers.get("user-agent") ?? "unknown";

    if (!client_id || !pathname) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    if (BLOCKED_CLIENT_IDS.has(client_id)) {
      return NextResponse.json({ ok: true, skipped: "blocked_client" });
    }

    await supabase.from("map_switch_logs").insert({
      client_id,
      pathname,
      referrer: referrer ?? null,
      source: source ?? "unknown",
      ip_address: ip,
      country,
      user_agent,
      clicked_at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });

  } catch (e) {
    return NextResponse.json(
      { error: "Bad request" },
      { status: 400 }
    );
  }
}