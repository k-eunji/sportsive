// src/app/api/fanhub/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fanhub/list`, {
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json({ posts: data });
}
