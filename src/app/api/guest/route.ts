//src/app/api/guest/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

function randomSpectatorName() {
  const num = Math.floor(100 + Math.random() * 900); // 100~999
  return `Spectator ${num}`;
}

export async function POST() {
  const guestId = crypto.randomUUID();
  const displayName = randomSpectatorName();

  return NextResponse.json({
    id: guestId,
    displayName,
    role: "guest",
  });
}
