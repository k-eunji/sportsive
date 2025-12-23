//src/app/api/likes/count/route.ts
export const runtime = "nodejs";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parentType = url.searchParams.get("type");
  const parentId = url.searchParams.get("id");

  if (!parentType || !parentId)
    return NextResponse.json({ count: 0 });

  const snap = await adminDb
    .collection("likes")
    .doc(parentType)
    .collection(parentId)
    .get();

  return NextResponse.json({ count: snap.size });
}
