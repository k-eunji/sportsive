// src/app/api/notifications/utils.ts
import { db } from "@/lib/firebaseAdmin";

/** ✅ Create a new notification */
export async function createNotification({
  userId,
  fromUserId,
  type,
  message,
  meetupId,
}: {
  userId: string;
  fromUserId?: string;
  type?: string;
  message: string;
  meetupId?: string;
}) {
  const notif = {
    userId,
    fromUserId: fromUserId || null,
    type: type || "general",
    message,
    meetupId: meetupId || null,
    read: false,
    createdAt: new Date().toISOString(),
  };

  await db.collection("notifications").add(notif);
  return notif;
}

/** ✅ Mark notification as read */
export async function markNotificationAsRead(notificationId: string) {
  const ref = db.collection("notifications").doc(notificationId);
  await ref.update({ read: true });
}

/** ✅ Get all notifications for a user */
export async function getUserNotifications(userId: string) {
  const snap = await db
    .collection("notifications")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
