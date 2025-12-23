// src/app/api/meetups/route.ts

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/meetups
 * - ?limit=숫자 파라미터 지원
 * - Firestore에서 최신 meetup n개를 가져옴
 */
export async function GET(req: NextRequest) {
  try {
    const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? 10);
    const finalLimit =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;

    const snap = await adminDb
      .collection("meetups")
      .orderBy("datetime", "desc")
      .limit(finalLimit)
      .get();

    const meetups = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ meetups });
  } catch (error) {
    console.error("❌ Error fetching meetups:", error);
    return NextResponse.json({ meetups: [] }, { status: 500 });
  }
}
