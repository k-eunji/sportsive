// ✅ src/lib/reward.ts
import { adminDb } from "@/lib/firebaseAdmin";
import { getActionPoint } from "@/lib/points";
import { getLevel } from "@/lib/levels";

interface RewardResult {
  success: boolean;
  delta: number;
  newPoints?: number;
  newLevel?: string;
  error?: string;
}

export async function rewardUser(userId: string, action: string): Promise<RewardResult> {
  try {
    const delta = getActionPoint(action as any);
    if (delta === 0) {
      console.warn(`⚠️ Unknown or unsupported action: ${action}`);
      return { success: false, delta: 0, error: "Unknown action" };
    }

    // ✅ Firestore reference 수정
    const ref = adminDb.collection("users").doc(userId);
    const snap = await ref.get();

    if (!snap.exists) {
      console.warn(`⚠️ User not found: ${userId}`);
      return { success: false, delta, error: "User not found" };
    }

    const data = snap.data() || {};
    const currentPoints = data.points || 0;
    const newPoints = Math.max(currentPoints + delta, 0);
    const newLevel = getLevel(newPoints);

    await ref.update({
      points: newPoints,
      level: newLevel.name,
      updatedAt: new Date().toISOString(),
    });

    await adminDb.collection("points_logs").add({
      userId,
      action,
      delta,
      before: currentPoints,
      after: newPoints,
      level: newLevel.name,
      createdAt: new Date().toISOString(),
    });

    console.log(
      `🎯 rewardUser: ${userId} ${delta > 0 ? "+" : ""}${delta} pts → ${newPoints} (${newLevel.name})`
    );

    return { success: true, delta, newPoints, newLevel: newLevel.name };
  } catch (err: any) {
    console.error("🔥 rewardUser failed:", err);
    return { success: false, delta: 0, error: err.message || "Unknown error" };
  }
}
