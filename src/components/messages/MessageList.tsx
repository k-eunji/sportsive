//src/components/messages/MessageList.tsx 

"use client";
import dayjs from "dayjs";
import { useEffect, useRef, useMemo } from "react";
import MessageItem from "./MessageItem";

export default function MessageList({ messages, user }: any) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const safeMessages = Array.isArray(messages) ? messages : [];

  const { groupedByDate, sortedDates } = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const msg of safeMessages) {
      const dateKey = msg?.createdAt
        ? dayjs(msg.createdAt).format("YYYY-MM-DD")
        : "unknown";
      (grouped[dateKey] ||= []).push(msg);
    }
    const dates = Object.keys(grouped).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    return { groupedByDate: grouped, sortedDates: dates };
  }, [safeMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [safeMessages]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 bg-background">
      {safeMessages.length > 0 ? (
        sortedDates.map((date) => (
          <div key={date}>
            <div className="flex justify-center my-3">
              <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {date === "unknown" ? "Unknown" : dayjs(date).format("D MMM YYYY")}
              </span>
            </div>
            <div className="space-y-1">
              {groupedByDate[date].map((m: any) => (
                <MessageItem
                  key={m.id || `${m.text}-${m.createdAt ?? ""}`}
                  message={m}
                  user={user}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground text-sm mt-10">
          No messages yet. Start chatting below 👇
        </p>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
