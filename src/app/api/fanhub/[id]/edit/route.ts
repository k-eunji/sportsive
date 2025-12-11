// src/app/api/fanhub/[id]/edit/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ⬅️ 반드시 await
  const { text } = await req.json();

  await db
    .collection("fanhub")
    .doc("global")
    .collection("messages")
    .doc(id)
    .update({
      text,
      updatedAt: new Date().toISOString(),
    });

  return NextResponse.json({ success: true });
}
