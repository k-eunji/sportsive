//src/app/api/fanhub/[id]/delete/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: any) {
  const { id } = params;

  await db
    .collection("fanhub")
    .doc("global")
    .collection("messages")
    .doc(id)
    .delete();

  return NextResponse.json({ success: true });
}
