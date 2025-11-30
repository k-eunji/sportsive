// src/app/meetups/[meetupId]/hooks/useMeetupData.ts

"use client";

import { useEffect, useState, useCallback } from "react";
import type { MeetupWithEvent } from "@/types/event";

/**
 * ✅ Tailwind 4 + Next.js 15 환경에 맞춘 Meetup 데이터 훅
 * - Next.js App Router의 fetch 캐시 무효화 적용 (cache: "no-store")
 * - "reviewed=true" 쿼리 제거 시 pushState 대신 replaceState 사용
 * - 타입 안정성 강화 및 로딩 상태 명확화
 */
export function useMeetupData(meetupId: string) {
  const [meetup, setMeetup] = useState<MeetupWithEvent | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * ✅ 쿼리 파라미터 정리
   * 리뷰 완료 후 돌아올 때 ?reviewed=true 가 붙으면 URL 클린업
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("reviewed") === "true") {
      url.searchParams.delete("reviewed");
      window.history.replaceState({}, "", url.toString());
      // ✅ 전면 새로고침 대신 데이터만 새로 불러오도록 개선
      window.dispatchEvent(new CustomEvent("refresh-meetup"));
    }
  }, []);

  /**
   * ✅ Meetup 데이터 fetch 함수
   * Next.js 15의 Request 캐시 정책에 따라 cache: "no-store"로 강제 최신화
   */
  const fetchMeetupData = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetups/${meetupId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch meetup");
      const data = await res.json();
      setMeetup(data);
    } catch (err) {
      console.error("❌ Error fetching meetup:", err);
    } finally {
      setLoading(false);
    }
  }, [meetupId]);

  /**
   * ✅ 데이터 초기 로드 및 reviewed 이벤트 대응
   */
  useEffect(() => {
    fetchMeetupData();

    const handleRefresh = () => fetchMeetupData();
    window.addEventListener("refresh-meetup", handleRefresh);

    return () => {
      window.removeEventListener("refresh-meetup", handleRefresh);
    };
  }, [fetchMeetupData]);

  return { meetup, setMeetup, loading };
}
