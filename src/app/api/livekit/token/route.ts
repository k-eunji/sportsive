// src/app/api/livekit/token/route.ts

import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET() {
  // 랜덤 사용자 ID
  const identity = `user_${Math.floor(Math.random() * 1000)}`;
  const room = "testRoom";

  const at = new AccessToken(
    process.env.LIVEKIT_KEY!,
    process.env.LIVEKIT_SECRET!,
    { identity }
  );

  at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();
  return NextResponse.json({ token, room, identity });
}
