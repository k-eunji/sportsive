// src/app/api/fanhub/[id]/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ★ OK

  const ref = db
    .collection("fanhub")
    .doc("global")
    .collection("messages")
    .doc(id);

  const doc = await ref.get();

  if (!doc.exists) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json({ id: doc.id, ...doc.data() });
}
