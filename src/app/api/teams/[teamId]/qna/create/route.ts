// src/app/api/teams/[teamId]/qna/create/route.ts

import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: any) {
  const { teamId } = await params;
  const { question, userId, authorNickname, avatarUrl, imageUrl } = await req.json();

  const ref = adminDb.collection("teams").doc(teamId).collection("qna").doc();
  const data = {
    id: ref.id,
    createdAt: new Date().toISOString(),
    data: {
      question,
      authorNickname,
      avatarUrl: avatarUrl ?? null,
      imageUrl: imageUrl ?? null,
      userId,
      answers: []
    }
  };
  await ref.set(data);

  return NextResponse.json(data);
}
