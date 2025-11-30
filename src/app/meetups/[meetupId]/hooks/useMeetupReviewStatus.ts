// src/app/meetups/[meetupId]/hooks/useMeetupReviewStatus.ts

"use client";

import { useEffect, useState } from "react";
import type { MeetupWithEvent } from "@/types/event";

/**
 * ✅ Next.js 15 + Tailwind 4 대응 버전
 * - 사용자 리뷰 여부를 서버에서 확인
 * - fetch 요청은 "no-store"로 최신 데이터만 가져옴
 * - 불필요한 재요청 방지를 위해 AbortController 적용
 * - meetup이 변경될 때만 다시 확인 (참여 후 리뷰 가능 상태 반영)
 */
export function useMeetupReviewStatus(
  meetupId: string,
  user: { userId: string } | null,
  meetup: MeetupWithEvent | null
) {
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (!user?.userId) return;
    if (!meetupId) return;

    const controller = new AbortController();

    const fetchReviewStatus = async () => {
      try {
        const res = await fetch(`/api/meetups/${meetupId}/reviews`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Failed to fetch reviews");

        const reviews = await res.json();

        // ✅ 유저 ID 기준으로 리뷰 존재 여부 확인
        const alreadyReviewed = reviews.some(
          (r: any) => r.fromUserId === user.userId || r.userId === user.userId
        );

        setHasReviewed(alreadyReviewed);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("❌ Error checking review status:", err);
        }
      }
    };

    fetchReviewStatus();

    return () => controller.abort();
  }, [user?.userId, meetupId, meetup]);

  return { hasReviewed };
}
