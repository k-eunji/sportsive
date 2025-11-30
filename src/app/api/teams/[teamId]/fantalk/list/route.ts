// api/teams/[teamId]/fantalk/list/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: any) {
  const { teamId } = await context.params; // ✅ FIXED

  const snap = await db
    .collection("teams")
    .doc(teamId)
    .collection("fantalk")
    .orderBy("createdAt", "desc")
    .get();

  return NextResponse.json(
    snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  );
}
