// src/app/api/teams/[teamId]/fantalk/[msgId]/delete/route.ts

export const dynamic = "force-dynamic";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { teamId: string; msgId: string };
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { teamId, msgId } = params;

  try {
    await adminDb
      .collection("teams")
      .doc(teamId)
      .collection("fantalk")
      .doc(msgId)
      .delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ fantalk delete failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
