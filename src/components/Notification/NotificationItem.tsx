// src/components/Notification/NotificationItem.tsx

"use client";

import { X, Trash2 } from "lucide-react";
import { useState, useRef } from "react";

export default function NotificationItem({
  data,
  onClick,
  onDelete,
}: {
  data?: any;
  onClick: () => void;
  onDelete: () => void;
}) {
  if (!data || typeof data !== "object") return null;

  const { message = "", read = false, type = "general" } = data;
  const [offsetX, setOffsetX] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const startXRef = useRef(0);

  const getEmoji = () => {
    switch (type) {
      case "review_received":
        return "⭐";
      case "review_reply":
        return "💬";
      case "join":
        return "👋";
      case "cancel":
        return "🚪";
      case "removed":
        return "⚠️";
      default:
        return "📢";
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = startXRef.current - e.touches[0].clientX;
    if (diff > 0 && diff < 80) setOffsetX(diff);
  };

  const handleTouchEnd = () => {
    setSwiped(offsetX > 40);
    setOffsetX(0);
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden touch-pan-y select-none">
      {/* 🗑️ 휴지통 버튼 (스와이프 시 노출) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete notification"
        title="Delete notification"
        className={`absolute right-0 top-0 z-10 flex h-full w-14 items-center justify-center rounded-l-lg bg-destructive text-destructive-foreground transition-all duration-200 ${
          swiped ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Trash2 size={18} />
      </button>

      {/* 🔔 알림 내용 */}
      <div
        className={`flex items-start justify-between px-4 py-3 text-sm cursor-pointer transition-all duration-200 ease-out ${
          !read
            ? "bg-accent font-semibold text-foreground"
            : "bg-background text-muted-foreground"
        }`}
        style={{
          transform: `translateX(-${swiped ? 56 : offsetX}px)`,
        }}
        onClick={onClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-1 items-start gap-2 overflow-hidden whitespace-normal break-words">
          <span className="flex-shrink-0">{getEmoji()}</span>
          <span className="leading-snug break-words">{message}</span>
        </div>

        {/* ❌ 데스크톱용 X 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete notification"
          title="Delete notification"
          className="
            ml-2 hidden flex-shrink-0 rounded-full p-1 text-muted-foreground 
            transition-all hover:text-destructive focus-visible:outline-none 
            focus-visible:ring-2 focus-visible:ring-ring sm:block
          "
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
