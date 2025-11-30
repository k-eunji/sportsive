// src/app/meetups/[meetupId]/handlers/useAttendanceHandlers.ts

"use client";

import { useCallback } from "react";
import type { MeetupWithEvent } from "@/types/event";

/**
 * Tailwind 4 + Next.js 15 환경용 참석/취소 핸들러 훅
 * - fetch는 기본적으로 Next.js App Router의 Request 캐싱 규칙에 맞게 no-store 처리
 * - alert는 UI 피드백 단순 처리 (별도 toast 시스템으로 대체 가능)
 * - 타입 안정성을 위해 user를 명확히 체크
 */
export function useAttendanceHandlers(
  meetup: MeetupWithEvent | null,
  setMeetup: React.Dispatch<React.SetStateAction<MeetupWithEvent | null>>,
  user: { userId: string } | null
) {
  const handleAttend = useCallback(async () => {
    if (!user) {
      alert("Please log in first!");
      return;
    }

    try {
      const res = await fetch(`/api/meetups/${meetup?.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId }),
        cache: "no-store",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Unknown error");
      }

      alert("✅ You’ve joined this meetup!");

      // 데이터 새로 고침 (Next.js 15의 fetch 캐시 방지)
      const refreshed = await fetch(`/api/meetups/${meetup?.id}`, {
        cache: "no-store",
      });

      if (refreshed.ok) {
        const data = await refreshed.json();
        setMeetup(data);
      }
    } catch (err: any) {
      console.error("❌ Error joining meetup:", err);
      alert(`❌ Failed to join: ${err.message}`);
    }
  }, [meetup, user, setMeetup]);

  const handleCancelAttend = useCallback(async () => {
    if (!user) {
      alert("Please log in first!");
      return;
    }

    if (!confirm("Do you really want to cancel your attendance?")) return;

    try {
      const res = await fetch(`/api/meetups/${meetup?.id}/attendees/${user.userId}`, {
        method: "DELETE",
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel attendance");

      alert("❌ You have canceled your attendance.");

      // 로컬 상태에서만 즉시 반영 (UX 향상)
      setMeetup((prev) =>
        prev
          ? ({
              ...prev,
              participantsDetailed: prev.participantsDetailed?.filter(
                (a) => a.id !== user.userId
              ),
              participants: prev.participants?.filter((id) => id !== user.userId),
              participantsCount: Math.max((prev.participantsCount || 1) - 1, 0),
            } as MeetupWithEvent)
          : prev
      );
    } catch (err) {
      console.error("❌ Error canceling attendance:", err);
      alert("An error occurred while canceling your attendance.");
    }
  }, [meetup, user, setMeetup]);

  return { handleAttend, handleCancelAttend };
}
