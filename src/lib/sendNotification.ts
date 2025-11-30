// src/lib/sendNotification.ts
import { db } from "@/lib/firebaseAdmin";

interface NotificationData {
  userId: string; // 알림 받는 사람
  fromUserId: string; // 알림 보낸 사람
  meetupId: string;
  message: string;
  type:
    | "join"
    | "cancel"
    | "removed"
    | "review_received"
    | "review_reply"; // ✅ 세미콜론 제거, 쉼표 X
  link?: string; // ✅ 선택적 필드로 추가
}

export async function sendNotification({
  userId,
  fromUserId,
  meetupId,
  message,
  type,
  link,
}: NotificationData) {
  try {
    await db.collection("notifications").add({
      userId,
      fromUserId,
      meetupId,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      ...(link ? { link } : {}), // ✅ link가 있으면 포함
    });

    console.log(`📩 Notification sent to ${userId}: ${message}`);
  } catch (err) {
    console.error("❌ Error sending notification:", err);
  }
}
