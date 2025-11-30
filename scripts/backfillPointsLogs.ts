//sportsive/scripts/backfillPointsLogs.ts

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { db } from "../src/lib/firebaseAdmin.js";
import { getLevel } from "../src/lib/levels.js";
/**
 * ✅ 기존 유저들의 포인트를 기반으로 포인트 로그 생성
 * points_logs에 기존 로그가 없는 경우만 추가
 */
export async function backfillPointsLogs() {
  console.log("🚀 Starting points backfill...")

  const usersSnap = await db.collection("users").get()
  const logsSnap = await db.collection("points_logs").get()

  const existingUserIds = new Set(
    logsSnap.docs.map((doc) => doc.data().userId as string)
  )

  let createdCount = 0

  for (const userDoc of usersSnap.docs) {
    const user = userDoc.data()
    const userId = userDoc.id
    const points = user.points ?? 0

    if (existingUserIds.has(userId)) {
      console.log(`⏩ Skipping ${userId} (logs already exist)`)
      continue
    }

    if (points <= 0) continue

    const level = getLevel(points)
    const description = "🌟 Previous points before log system"

    await db.collection("points_logs").add({
      userId,
      action: "INITIAL_BACKFILL",
      description,
      delta: points,
      before: 0,
      after: points,
      level: level.name,
      createdAt: new Date().toISOString(),
    })

    console.log(`✅ Backfilled ${points} pts for ${userId}`)
    createdCount++
  }

  console.log(`🎉 Backfill complete — ${createdCount} users updated`)
}

// ✅ 단독 실행용
if (process.argv[1].endsWith("backfillPointsLogs.ts")) {
  backfillPointsLogs()
    .then(() => {
      console.log("✅ Script finished successfully.")
      process.exit(0)
    })
    .catch((err) => {
      console.error("❌ Script failed:", err)
      process.exit(1)
    })
}
