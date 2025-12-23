// src/app/api/users/[userId]/points/route.ts

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getActionPoint, ACTION_DESCRIPTIONS, ActionType } from "@/lib/points";
import { getLevel } from "@/lib/levels";

interface RouteParams {
  params: { userId: string };
}

// ✅ POST — 포인트 업데이트
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = params;

    const { action } = await req.json();
    if (!action) {
      return NextResponse.json(
        { error: "Missing action type" },
        { status: 400 }
      );
    }

    const typedAction = action as ActionType;
    const delta = getActionPoint(typedAction);

    if (delta === 0) {
      return NextResponse.json(
        { error: "Unsupported action" },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = snap.data() || {};
    const currentPoints = userData.points || 0;
    const newPoints = Math.max(currentPoints + delta, 0);
    const newLevel = getLevel(newPoints);

    const description = ACTION_DESCRIPTIONS[typedAction] ?? typedAction;

    // ⭐ 업데이트
    await userRef.update({
      points: newPoints,
      level: newLevel.name,
      updatedAt: new Date().toISOString(),
    });

    // ⭐ 로그 기록
    await adminDb.collection("points_logs").add({
      userId,
      action: typedAction,
      description,
      delta,
      before: currentPoints,
      after: newPoints,
      level: newLevel.name,
      createdAt: new Date(),
    });

    console.log(
      `🏅 User ${userId}: ${description} (${delta > 0 ? "+" : ""}${delta} pts)`
    );

    return NextResponse.json({
      success: true,
      action: typedAction,
      description,
      delta,
      newPoints,
      newLevel: newLevel.name,
      levelDesc: newLevel.desc,
    });
  } catch (err: any) {
    console.error("❌ Error updating user points:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to update points" },
      { status: 500 }
    );
  }
}

// ✅ GET — 포인트 로그 조회
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = params;

    const snap = await adminDb
      .collection("points_logs")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const logs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("❌ Failed to fetch points logs:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch points logs" },
      { status: 500 }
    );
  }
}
