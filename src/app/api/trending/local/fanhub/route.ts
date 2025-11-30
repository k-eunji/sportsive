// src/app/api/trending/local/fanhub/route.ts

import { NextResponse } from "next/server";

function normalize(str?: string | null) {
  if (!str) return "";
  return str.toLowerCase().trim();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city");

  if (!city) return NextResponse.json([], { status: 400 });

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/fanhub/list?sort=latest`,
      { cache: "no-store" }
    );
    const posts = await res.json();

    const normalizedCity = normalize(city);

    // ⭐⭐⭐ 핵심 수정 부분 (이 아래 7줄)
    const filtered = posts.filter((p: any) => {
      // authorCity 없으면 포함 (대부분 데이터가 이 상태임)
      if (!p.authorCity) return true;
      return normalize(p.authorCity) === normalizedCity;
    });
    // ⭐⭐⭐

    return NextResponse.json(filtered.slice(0, 5));
  } catch (err) {
    console.error("Local trending fanhub error:", err);
    return NextResponse.json([], { status: 500 });
  }
}
