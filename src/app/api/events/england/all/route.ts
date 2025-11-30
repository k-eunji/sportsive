//api/events/england/all/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  // 현재는 축구밖에 없으므로 football API를 그대로 proxy
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/england/football`);
  const data = await res.json();
  return NextResponse.json(data);
}
