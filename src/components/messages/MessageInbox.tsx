//src/components/messages/MessageInbox.tsx

"use client";

import { useState, useEffect } from "react";
import UserAvatar from "@/components/UserAvatar";
import MessageActions from "./MessageActions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

function formatShortRelativeTime(date: string | number | Date) {
  const diff = dayjs().diff(dayjs(date), "second");
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}w`;
}

interface MessageInboxProps {
  inbox: any[];
  user: any;
  onSelect: (conversationId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

// ✅ 터치 가능한 PC에서도 스와이프를 막기 위한 헬퍼
function isReallyMobile() {
  if (typeof window === "undefined") return false;
  
  const ua = navigator.userAgent.toLowerCase();
  const isWindows = ua.includes("windows");
  const isMac = ua.includes("macintosh");
  const isDesktopOS = isWindows || isMac;

  const touchCapable = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const smallScreen = window.innerWidth < 768;

  // ✅ 모바일만 true: 작은 화면 + 터치 가능 + 데스크톱 OS 아님
  return smallScreen && touchCapable && !isDesktopOS;
}

export default function MessageInbox({
  inbox,
  user,
  onSelect,
  onRefresh,
  isLoading = false,
}: MessageInboxProps) {
  const [localInbox, setLocalInbox] = useState(inbox);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);

  // ✅ 모바일 판정: 터치 + 작은 화면만 true
  const [isMobile, setIsMobile] = useState(isReallyMobile());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isReallyMobile());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    // ✅ 이 부분 추가
    useEffect(() => {
      setLocalInbox(inbox);
    }, [inbox]);

  // ✅ 대화 삭제 후 로컬 목록에서 제거
  const handleLocalUpdate = (conversationId: string) => {
    setLocalInbox((prev) => prev.filter((c) => c.id !== conversationId));
    onRefresh?.(); // 선택적으로 상위에서 inbox 다시 불러올 수도 있음
  };


  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    if (!isMobile) return; // ✅ 데스크톱 터치는 무시
    setTouchStartX(e.touches[0].clientX);
    setSwipedId(null);
  };

  const handleTouchMove = (e: React.TouchEvent, id: string) => {
    if (!isMobile) return; // ✅ 갤럭시북은 여기서 걸러짐
    const diffX = e.touches[0].clientX - touchStartX;
    if (diffX < -60) setSwipedId(id);
    if (diffX > 60) setSwipedId(null);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground animate-pulse text-sm">
        Loading conversations...
      </div>
    );

  if (!isLoading && localInbox.length === 0)
    return (
      <div className="text-center text-sm text-muted-foreground p-6">
        No conversations
      </div>
    );

  return (
    <div>
      {localInbox.map((c) => {
        const isMine = c.lastSender === user?.userId;
        const hasUnread = c.unreadCount > 0;
        const time = c.updatedAt ? formatShortRelativeTime(c.updatedAt) : "";

        let statusText = "";
        if (hasUnread)
          statusText =
            c.unreadCount === 1
              ? `${c.lastMessage?.slice(0, 30)} · ${time}`
              : `${c.unreadCount} new messages · ${time}`;
        else if (isMine)
          statusText = c.lastMessageIsRead ? "seen" : `sent ${time}`;
        else
          statusText = c.lastMessage
            ? `${c.lastMessage.slice(0, 30)} · ${time}`
            : time;

        const showActions = isMobile ? swipedId === c.id : true;

        return (
          <div
            key={c.id}
            onTouchStart={(e) => handleTouchStart(e, c.id)}
            onTouchMove={(e) => handleTouchMove(e, c.id)}
            className="relative group overflow-visible"
          >
            {/* 메시지 행 */}
            <div
              onClick={() => onSelect(c.id)}
              className={`flex items-center justify-between gap-3 p-3 border-b border-border transition-transform duration-200 ease-in-out ${
                isMobile && swipedId === c.id
                  ? "-translate-x-20"
                  : "translate-x-0"
              } ${!isMobile && "hover:bg-muted/40"}`}
            >
              <div className="flex items-center gap-3 flex-1 cursor-pointer">
                <UserAvatar
                  userId={c.otherUserId}
                  size={48}
                  showName={false}
                  linkToProfile={false}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-foreground truncate">
                      {c.authorNickname ?? c.otherUserId}
                    </span>
                    {hasUnread && (
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {statusText}
                  </div>
                </div>
              </div>

              {/* ✅ PC / 갤럭시북: 항상 표시 */}
              {!isMobile && (
                <MessageActions
                  conversationId={c.id}
                  userId={c.otherUserId}
                  token={user?.token}
                  onActionDone={() => handleLocalUpdate(c.id)}
                />
              )}
            </div>

            {/* 모바일 전용: 스와이프 시 */}
            {isMobile && showActions && (
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 bg-background p-1 rounded-lg shadow-md z-10"
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <MessageActions
                  conversationId={c.id}
                  userId={c.otherUserId}
                  token={user?.token}
                  onActionDone={() => handleLocalUpdate(c.id)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
