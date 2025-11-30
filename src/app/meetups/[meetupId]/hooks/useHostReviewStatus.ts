//src/app/meetups/[meetupId]/hooks/useHostReviewStatus.ts

"use client";

import { useEffect, useState } from "react";

export function useHostReviewStatus(meetupId: string, userId: string | null) {
  const [hostReview, setHostReview] = useState<any | null>(null);

  useEffect(() => {
    if (!userId || !meetupId) return;

    const fetchHostReview = async () => {
      try {
        const res = await fetch(`/api/meetups/${meetupId}/reviews?targetType=all`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();

        // ✅ 호스트가 나(참가자)에게 남긴 리뷰 찾기
        const reviewFromHost = data.find(
          (r: any) => r.fromUserId && r.targetUserId === userId && r.fromUserId !== userId
        );

        setHostReview(reviewFromHost || null);
      } catch (err) {
        console.error("❌ Error fetching host review:", err);
      }
    };

    fetchHostReview();
  }, [meetupId, userId]);

  return { hostReview };
}
