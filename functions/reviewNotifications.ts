// functions/reviewNotifications.ts
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const sendReviewNotifications = functions.scheduler.onSchedule("every 1 hours", async () => {
  const now = new Date();

  const meetupsSnap = await db.collection("meetups")
    .where("datetime", "<=", new Date(now.getTime() - 60 * 60 * 1000))
    .where("status", "==", "confirmed")
    .where("reviewNotified", "==", false)
    .get();

  for (const doc of meetupsSnap.docs) {
    const meetup = doc.data();
    const participants = meetup.participants || [];
    const allUsers = [...participants, meetup.hostId];

    for (const userId of allUsers) {
      await db.collection("notifications").add({
        toUserId: userId,
        type: "review_request",
        meetupId: doc.id,
        message: `‘${meetup.title}’ 밋업은 어땠나요? 리뷰를 남겨주세요.`,
        isRead: false,
        createdAt: admin.firestore.Timestamp.now(),
      });
    }

    await doc.ref.update({ reviewNotified: true });
  }
});
