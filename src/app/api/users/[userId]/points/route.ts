// ✅ src/app/api/users/[userId]/points/route.ts

import { NextResponse } from "next/server"
import { db } from "@/lib/firebaseAdmin"
import { getActionPoint, ACTION_DESCRIPTIONS, ActionType } from "@/lib/points"
import { getLevel } from "@/lib/levels"

export async function POST(
  req: Request,
  context:
    | { params: { userId: string } }
    | { params: Promise<{ userId: string }> }
) {
  const rawParams = (context as any).params
  const { userId } =
    typeof rawParams.then === "function" ? await rawParams : rawParams

  try {
    const { action } = await req.json()
    if (!action)
      return NextResponse.json({ error: "Missing action type" }, { status: 400 })

    const typedAction = action as ActionType // 👈 타입 명시
    const delta = getActionPoint(typedAction)

    if (delta === 0)
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 })

    const userRef = db.collection("users").doc(userId)
    const userSnap = await userRef.get()
    if (!userSnap.exists)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const userData = userSnap.data() || {}
    const currentPoints = userData.points || 0
    const newPoints = Math.max(currentPoints + delta, 0)
    const newLevel = getLevel(newPoints)

    // ✅ 설명 추가
    const description = ACTION_DESCRIPTIONS[typedAction] || action

    // ✅ 포인트 업데이트
    await userRef.update({
      points: newPoints,
      level: newLevel.name,
      updatedAt: new Date().toISOString(),
    })

    // ✅ 로그 추가
    await db.collection("points_logs").add({
      userId,
      action: typedAction,
      description,
      delta,
      before: currentPoints,
      after: newPoints,
      level: newLevel.name,
      createdAt: new Date(),
    })

    console.log(
      `🏅 User ${userId}: ${description} (${delta > 0 ? "+" : ""}${delta} pts)`
    )

    return NextResponse.json({
      success: true,
      action: typedAction,
      description,
      delta,
      newPoints,
      newLevel: newLevel.name,
      levelDesc: newLevel.desc,
    })
  } catch (err: any) {
    console.error("❌ Error updating user points:", err)
    return NextResponse.json(
      { error: err.message || "Failed to update points" },
      { status: 500 }
    )
  }
}

// ✅ 수정된 GET
export async function GET(
  _req: Request,
  context: { params: { userId: string } } | { params: Promise<{ userId: string }> }
) {
  const rawParams = (context as any).params;
  const { userId } =
    typeof rawParams.then === "function" ? await rawParams : rawParams;

  try {
    const snap = await db
      .collection("points_logs")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const logs = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error("❌ Failed to fetch points logs:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch points logs" },
      { status: 500 }
    );
  }
}
