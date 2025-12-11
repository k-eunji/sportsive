// src/app/api/trending/local/fanhub/route.ts
import { NextRequest, NextResponse } from "next/server";

function normalize(str?: string | null) {
  return (str ?? "").toLowerCase().trim();
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  if (!city) return NextResponse.json([], { status: 400 });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/fanhub/list?sort=latest`,
      { cache: "no-store" }
    );

    const posts = await res.json();
    const normalizedCity = normalize(city);

    const filtered = posts.filter((p: any) => {
      // authorCity가 없으면 포함 (현재 대부분 데이터 구조)
      if (!p.authorCity) return true;
      return normalize(p.authorCity) === normalizedCity;
    });

    return NextResponse.json(filtered.slice(0, 5));
  } catch (err) {
    console.error("❌ Local trending fanhub error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
