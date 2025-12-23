// src/app/api/teams/[teamId]/fantalk/list/route.ts

export const dynamic = "force-dynamic";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { teamId: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { teamId } = params;

  try {
    const snap = await adminDb
      .collection("teams")
      .doc(teamId)
      .collection("fantalk")
      .orderBy("createdAt", "desc")
      .get();

    const messages = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json(messages);
  } catch (err) {
    console.error("❌ fantalk list failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load fan talk messages" },
      { status: 500 }
    );
  }
}
