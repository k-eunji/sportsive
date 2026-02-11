// src/app/api/log/visit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

/**
 * ❌ 기록하지 않을 client_id (개발자 / 테스트용)
 */
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

    const {
      client_id,
      is_within_first_24h,
      entry_reason,
      document_visibility, // 👈 추가
    } = body;

    // ✅ 특정 client_id는 기록 안 함
    if (client_id && BLOCKED_CLIENT_IDS.has(client_id)) {
      return NextResponse.json({ ok: true, skipped: "blocked_client" });
    }

    // ✅ payload 검증
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

    // ✅ Supabase 기록
    const { error } = await supabase
      .from("visit_logs")
      .insert({
        client_id,
        is_within_first_24h,
        entry_reason,
        document_visibility: document_visibility ?? null, // 👈 추가
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
