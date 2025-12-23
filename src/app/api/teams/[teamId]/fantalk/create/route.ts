// src/app/api/teams/[teamId]/fantalk/create/route.ts

export const dynamic = "force-dynamic";
import { adminDb } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { teamId: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { teamId } = params;

  try {
    const { text, imageUrl, userId, authorNickname } = await req.json();

    await adminDb
      .collection("teams")
      .doc(teamId)
      .collection("fantalk")
      .add({
        text,
        imageUrl: imageUrl || null,
        userId,
        authorNickname,
        createdAt: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ fantalk create failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create message" },
      { status: 500 }
    );
  }
}
