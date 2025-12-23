// src/lib/meetups.server.ts

import { adminDb } from "@/lib/firebaseAdmin"; 
import { rewardUser } from "@/lib/reward"; // ✅ 추가
import type { Meetup } from "@/types/event";

/**
 * ✅ 서버(Admin SDK) 전용 Meetup 생성 함수
 * Firestore에서 직접 문서를 생성 + 포인트 보상 지급
 */
export async function createMeetupServer(meetup: Partial<Meetup>): Promise<string> {
  try {
    console.log("📦 [Server] Creating meetup:", meetup);

    // Firestore 문서 ID 자동 생성
    const docRef = adminDb.collection("meetups").doc();

    // ✅ 표준화된 데이터 스키마 구성
    const data: Record<string, any> = {
      hostId: meetup.hostId ?? "",
      authorNickname: meetup.authorNickname ?? "Unknown",
      title: meetup.title ?? "",
      datetime: meetup.datetime ?? new Date().toISOString(),

      // ✅ 여기
      location: meetup.location ?? null,

      type: meetup.type ?? "other",
      maxParticipants: meetup.maxParticipants ?? 10,
      teamType: meetup.teamType ?? "neutral",
      teamId: meetup.teamId ?? null,
      participants: [],
      pendingParticipants: [],
      onlineGameName: meetup.onlineGameName ?? "",
      onlineLink: meetup.onlineLink ?? "",
      skillLevel: meetup.skillLevel ?? "any",
      createdAt: new Date(),
      fee: meetup.fee ?? 0,
      imageUrl: meetup.imageUrl ?? null,
      reviewsOpen: false,
    };

    // 선택적 필드
    if (meetup.eventId) data["eventId"] = meetup.eventId;
    if (meetup.applicationDeadline)
      data["applicationDeadline"] = meetup.applicationDeadline;

    // ✅ 1️⃣ Firestore에 저장
    await docRef.set(data);
    console.log("✅ [Server] Meetup created with ID:", docRef.id);

    // ✅ 2️⃣ 호스트 포인트 지급
    if (data.hostId) {
      console.log("🎯 Rewarding meetup host:", data.hostId);
      const reward = await rewardUser(data.hostId, "HOST_MEETUP");

      if (reward.success) {
        console.log(`🏅 Host rewarded: +${reward.delta} pts → ${reward.newPoints}`);
      } else {
        console.warn("⚠️ rewardUser failed:", reward.error);
      }
    } else {
      console.warn("⚠️ No hostId provided — skipping rewardUser");
    }

    return docRef.id;
  } catch (err) {
    console.error("❌ Firestore createMeetupServer error:", err);
    throw new Error("Failed to create meetup in Firestore");
  }
}
