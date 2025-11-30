// src/components/Notification/NotificationPopup.tsx

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { useUser } from "@/context/UserContext";
import NotificationItem from "./NotificationItem";
import { useRouter } from "next/navigation";

export default function NotificationPopup({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Firestore 실시간 알림 구독
  useEffect(() => {
    if (!user?.userId) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.userId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(list);
    });
    return () => unsub();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (err) {
      console.error("⚠️ Failed to mark as read:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete notification:", err);
      alert("Failed to delete notification.");
    }
  };

  const handleClick = (n: any) => {
    if (!n) return;
    markAsRead(n.id);
    onClose();
    if (n.meetupId) router.push(`/meetups/${n.meetupId}`);
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete all notifications?")) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user?.userId),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      setNotifications([]);
    } catch (err) {
      console.error("❌ Failed to delete all notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Notifications popup"
      className="
        absolute right-0 mt-2 w-80 max-w-[90vw]
        rounded-lg border border-border bg-popover shadow-lg
        z-50 animate-in fade-in-0 slide-in-from-top-2
      "
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="text-sm font-semibold text-foreground">
          Notifications
        </span>
        {notifications.length > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={loading}
            className="
              text-xs font-medium text-destructive hover:text-destructive/80
              transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            {loading ? "Deleting..." : "Delete All"}
          </button>
        )}
      </div>

      {/* 본문 */}
      {notifications.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          No notifications yet
        </div>
      ) : (
        <div
          className="
            max-h-80 overflow-y-auto overflow-x-hidden 
            scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
            scroll-smooth
          "
        >
          {notifications
            .filter((n) => n && typeof n === "object")
            .map((n) => (
              <NotificationItem
                key={n.id}
                data={n}
                onClick={() => handleClick(n)}
                onDelete={() => handleDelete(n.id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}
