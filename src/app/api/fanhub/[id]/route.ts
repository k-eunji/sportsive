//src/app/api/fanhub/[id]/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;   // ★ 반드시 await 해야 함

  const doc = await db
    .collection("fanhub")
    .doc("global")
    .collection("messages")
    .doc(id)
    .get();

  if (!doc.exists) return NextResponse.json(null, { status: 404 });

  return NextResponse.json({ id: doc.id, ...doc.data() });
}
