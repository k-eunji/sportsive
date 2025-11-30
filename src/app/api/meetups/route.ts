//src/app/api/meetups/route.ts

import { NextResponse } from "next/server";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * ✅ GET /api/meetups
 * - limit 쿼리 파라미터 지원 (예: /api/meetups?limit=3)
 * - Firebase Firestore에서 최근 밋업 n개를 가져옴
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit") ?? 10);

    const q = query(
      collection(db, "meetups"),
      orderBy("datetime", "desc"),
      limit(limitParam)
    );

    const snap = await getDocs(q);
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
