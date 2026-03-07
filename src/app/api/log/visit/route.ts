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
      document_visibility,
    } = body;

    /* ===============================
       1️⃣ IP 추출 (Vercel 안전 버전)
    =============================== */

    const ip =
      req.headers
        .get("x-vercel-forwarded-for")
        ?.split(",")[0]
        ?.trim() ??
      req.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    /* ===============================
       2️⃣ User-Agent 추출
    =============================== */

    const user_agent =
      req.headers.get("user-agent") ?? "unknown";

    const ua = user_agent.toLowerCase();

    /* ===============================
       3️⃣ 개발자 client 차단
    =============================== */

    if (client_id && BLOCKED_CLIENT_IDS.has(client_id)) {
      return NextResponse.json({
        ok: true,
        skipped: "blocked_client",
      });
    }

    /* ===============================
       4️⃣ 봇 / 스크래퍼 필터
    =============================== */

    const botUAKeywords = [
      "bot",
      "crawler",
      "spider",
      "headless",
      "curl",
      "python",
      "wget",
      "axios",
      "node-fetch",
      "httpclient",
      "postman",
      "insomnia",
      "scrapy",
      "phantom",
      "playwright",
      "puppeteer",
    ];

    const suspiciousUA = botUAKeywords.some((k) =>
      ua.includes(k)
    );

    if (ip === "unknown" || suspiciousUA) {
      return NextResponse.json({
        ok: true,
        skipped: "bot_filtered",
      });
    }

    /* ===============================
       5️⃣ 데이터센터 IP 간단 차단
    =============================== */

    const datacenterPrefixes = [
      "3.",
      "13.",
      "18.",
      "34.",
      "35.",
      "52.",
      "54.",
      "104.",
      "172.",
    ];

    const isDatacenterIP = datacenterPrefixes.some((p) =>
      ip.startsWith(p)
    );

    if (isDatacenterIP) {
      return NextResponse.json({
        ok: true,
        skipped: "datacenter_ip",
      });
    }

    /* ===============================
       6️⃣ payload 검증
    =============================== */

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

    /* ===============================
       7️⃣ DB 저장
    =============================== */

    const { error } = await supabase
      .from("visit_logs")
      .insert({
        client_id,
        is_within_first_24h,
        entry_reason,
        document_visibility: document_visibility ?? null,
        visited_at: new Date().toISOString(),
        ip_address: ip,
        user_agent,
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