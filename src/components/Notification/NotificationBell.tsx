// src/components/Notification/NotificationBell.tsx

"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useUser } from "@/context/UserContext";
import NotificationPopup from "./NotificationPopup";

export default function NotificationBell() {
  const { user, authReady } = useUser(); // 🔥 authReady 사용
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // 🚫 guest면 아예 렌더링 안 함
  if (!authReady || user?.role === "guest") {
    return null;
  }

  // ✅ 로그인 유저만 Firestore 구독
  useEffect(() => {
    if (!user?.userId) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.userId),
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    });

    return () => unsub();
  }, [user?.userId]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle notifications"
        title="Notifications"
        className="
          relative rounded-full p-2
          text-muted-foreground
          hover:bg-accent/50 hover:text-foreground/90
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          transition-all
        "
      >
        <Bell
          size={22}
          className={unreadCount > 0 ? "text-destructive" : "text-foreground"}
        />

        {unreadCount > 0 && (
          <span
            className="
              absolute -top-0.5 -right-0.5
              flex h-4 w-4 items-center justify-center
              rounded-full bg-destructive text-destructive-foreground
              text-[10px] font-bold
              ring-1 ring-background
            "
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && <NotificationPopup onClose={() => setOpen(false)} />}
    </div>
  );
}
