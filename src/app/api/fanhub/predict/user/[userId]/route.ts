//src/app/api/fanhub/predict/user/[userId]/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: any) {
  const { userId } = params;

  const snap = await db
    .collectionGroup("predictions")
    .where("userId", "==", userId)
    .get();

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(data);
}
