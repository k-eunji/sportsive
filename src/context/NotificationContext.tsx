// src/context/NotificationContext.tsx

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useUser } from "@/context/UserContext";

interface Notification {
  id: string;
  uerId: string;
  fromUserId?: string;
  type?: string;
  message: string;
  meetupId?: string;
  read: boolean;
  createdAt?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ 실시간 알림 구독
  useEffect(() => {
    if (!authReady) return;        // 🔥 추가
    if (!user?.userId) return;
    if (user.role === 'guest') return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.userId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Notification)
      );
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    });

    return () => unsub();
  }, [authReady, user]);

  // ✅ 개별 알림 읽음 처리
  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // ✅ 전체 알림 읽음 처리
  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      await updateDoc(doc(db, "notifications", n.id), { read: true });
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
