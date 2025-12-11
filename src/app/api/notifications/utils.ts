// src/app/api/notifications/utils.ts
import { db } from "@/lib/firebaseAdmin";

interface CreateNotifArgs {
  userId: string;
  fromUserId?: string;
  type?: string;
  message: string;
  meetupId?: string;
}

/** ✅ Create new notification */
export async function createNotification({
  userId,
  fromUserId,
  type,
  message,
  meetupId,
}: CreateNotifArgs) {
  const notif = {
    userId,
    fromUserId: fromUserId || null,
    type: type || "general",
    message,
    meetupId: meetupId || null,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const ref = await db.collection("notifications").add(notif);

  return { id: ref.id, ...notif };
}

/** ✅ Mark a single notification as read */
export async function markNotificationAsRead(notificationId: string) {
  await db.collection("notifications").doc(notificationId).update({
    read: true,
  });
}

/** ✅ Fetch all notifications for a user (latest first) */
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
