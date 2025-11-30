// ✅ functions/src/openReviews.ts
import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";

const db = admin.firestore();

/**
 * ⏰ 밋업 시작 1시간 후에 리뷰 오픈 & 알림 전송
 */
export const openReviewsAfterMeetup = onSchedule("every 15 minutes", async () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1시간 전

  // 🔍 datetime은 문자열이므로 Date로 변환 비교
  const snap = await db
    .collection("meetups")
    .where("reviewsOpen", "==", false)
    .get();

  if (snap.empty) {
    console.log("⏳ No meetups found.");
    return;
  }

  const batch = db.batch();

  for (const doc of snap.docs) {
    const data = doc.data();
    const meetupTime = new Date(data.datetime); // ✅ 문자열 -> Date 변환

    // ✅ 밋업이 1시간 이상 지난 경우만 처리
    if (meetupTime <= oneHourAgo) {
      const meetupId = doc.id;
      const title = data.title || "Your meetup";

      // ✅ 리뷰 오픈
      batch.update(doc.ref, { reviewsOpen: true });

      // ✅ 참석자 + 주최자 알림 전송
      const allRecipients = Array.from(
        new Set([data.hostId, ...(data.participants || [])])
      );

      allRecipients.forEach((uid: string) => {
        const notifRef = db.collection("notifications").doc();
        batch.set(notifRef, {
          toUserId: uid,
          type: "review_reminder",
          title: "Time to leave a review ✍️",
          message: `${title} meetup has ended! Please share your thoughts.`,
          meetupId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false,
        });
      });
    }
  }

  await batch.commit();
  console.log(`✅ ${snap.size} meetups processed for review open.`);
});
