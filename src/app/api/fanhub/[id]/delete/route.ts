// src/app/api/fanhub/[id]/delete/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ★ 반드시 await 해야 함

  await db
    .collection("fanhub")
    .doc("global")
    .collection("messages")
    .doc(id)
    .delete();

  return NextResponse.json({ success: true });
}
