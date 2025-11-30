//app/api/teams/[teamId]/fantalk/create/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: any) {
  const { teamId } = params;
  const { text, imageUrl, userId, authorNickname } = await req.json();

  await db
    .collection("teams")
    .doc(teamId)
    .collection("fantalk")
    .add({
      text,
      imageUrl: imageUrl || null,
      userId,
      authorNickname,
      createdAt: new Date().toISOString(),
    });

  return NextResponse.json({ success: true });
}
