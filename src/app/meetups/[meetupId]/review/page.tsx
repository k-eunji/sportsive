// src/app/meetups/[meetupId]/review/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/**
 * ✅ Next.js 15 + Tailwind 4 대응
 * - fetch는 모두 `cache: "no-store"` 처리
 * - 불필요한 새로고침 제거
 * - Tailwind 4 최신 스타일 가이드 적용
 * - UX 향상을 위한 로딩/상태 관리 개선
 */
export default function MeetupReviewPage() {
  const router = useRouter();
  const { meetupId } = useParams() as { meetupId: string };
  const { user } = useUser();

  const [meetup, setMeetup] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [targetType, setTargetType] = useState("meetup");
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /** ✅ 1️⃣ Meetup 데이터 + 리뷰 데이터 가져오기 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ 모든 리뷰(호스트→참가자 포함)를 가져오도록 all 파라미터 추가
        const [meetupRes, reviewRes] = await Promise.all([
          fetch(`/api/meetups/${meetupId}`, { cache: "no-store" }),
          fetch(`/api/meetups/${meetupId}/reviews?targetType=all`, { cache: "no-store" }),
        ]);

        if (meetupRes.ok) {
          const data = await meetupRes.json();
          setMeetup(data);
        }

        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData);

          const rated = reviewData.filter((r: any) => r.rating);
          if (rated.length > 0) {
            const avg =
              rated.reduce((sum: number, r: any) => sum + r.rating, 0) / rated.length;
            setAvgRating(Number(avg.toFixed(1)));
          }
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      }
    };

    fetchData();
  }, [meetupId]);

  /** ✅ 2️⃣ 유저 역할에 따라 리뷰 대상 설정 */
  useEffect(() => {
    if (meetup && user) {
      if (meetup.hostId === user.userId) {
        setTargetType("user"); // 호스트 → 참가자 평가
      } else {
        setTargetType("user"); // 참가자 → 호스트 평가
        setTargetUserId(meetup.hostId);
      }
    }
  }, [meetup, user]);

  useEffect(() => {
    console.log("🧩 Loaded reviews:", reviews);
  }, [reviews]);

  useEffect(() => {
    if (reviews.length > 0 && user) {
      console.log("📦 All Reviews:", reviews);
      const mine = reviews.filter(r => r.targetUserId === user.userId);
      console.log("🎯 My received reviews:", mine);
    }
  }, [reviews, user]);

  /** ✅ 3️⃣ 리뷰 작성 가능 여부 체크 */
  const canWriteReview = useCallback((meetup: any, userId: string | undefined): boolean => {
    if (!meetup?.datetime || !userId) return false;

    const now = new Date();
    const eventDate = new Date(meetup.datetime);
    const diffHours = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);

    const participants = meetup.participants || [];
    const isHost = meetup.hostId === userId;
    const isParticipant = participants.includes(userId);

    return diffHours >= 1 && (isHost || isParticipant);
  }, []);

  // ✅ 호스트가 나(참가자)에게 남긴 리뷰 찾기 (null/undefined 예외 포함)
  const myReceivedReview = reviews.find(
    (r) =>
      r.fromUserId === meetup?.hostId &&
      r.targetUserId === user?.userId &&
      r.targetType === "user" // ✅ 명확히 호스트→참가자 리뷰만 필터링
  );


  /** ✅ 4️⃣ 리뷰 제출 */
  const handleSubmit = useCallback(async () => {
    if (!user?.userId) return alert("Please log in first.");
    if (rating === 0) return alert("Please select a rating.");

    setLoading(true);
    try {
      const res = await fetch(`/api/meetups/${meetupId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          targetUserId, // ✅ 서버에서 기대하는 이름으로 보냄
          targetType,
          content: comment,
          rating,
        }),
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      const newReview = {
        id: data.id,
        fromUserId: user.userId,
        targetUserId,
        content: comment,
        rating,
        createdAt: new Date().toISOString(),
      };

      setReviews((prev) => [...prev, newReview]);
      const rated = [...reviews, newReview].filter((r) => r.rating);
      const avg = rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
      setAvgRating(Number(avg.toFixed(1)));
      setSubmitted(true);

      router.replace(`/meetups/${meetupId}?reviewed=true`);
    } catch (err) {
      console.error("❌ Error submitting review:", err);
      alert("An error occurred while saving your review.");
    } finally {
      setLoading(false);
    }
  }, [user, meetupId, targetUserId, targetType, comment, rating, reviews, router]);

  /** ✅ 5️⃣ 제출 완료 화면 */
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Your review has been submitted 🎉
        </h2>
        <button
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          onClick={() => router.push(`/meetups/${meetupId}`)}
        >
          Back to Meetup
        </button>
      </div>
    );
  }

  /** ✅ 6️⃣ 로딩 중 */
  if (!meetup) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-400">
        Loading meetup info...
      </div>
    );
  }

  /** ✅ 7️⃣ 리뷰 작성 불가 상태 */
  if (!canWriteReview(meetup, user?.userId)) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-4 text-gray-500">
        <p className="text-lg font-semibold mb-2">🕒 Review not available yet</p>
        <p className="text-sm mb-4">
          Only attendees can leave a review 1 hour after the meetup ends.
        </p>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          onClick={() => router.push(`/meetups/${meetupId}`)}
        >
          Back to Meetup
        </button>
      </div>
    );
  }

  /** ✅ 8️⃣ 리뷰 작성 화면 */
  return (
    <div className="max-w-md mx-auto p-6 mt-10 sm:mt-16 bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Leave a Review</h1>
      <p className="text-center text-gray-500 mb-6">
        Meetup: <span className="font-medium text-gray-700">{meetup.title}</span>
      </p>

      {/* ✅ 호스트가 나에게 남긴 리뷰 표시 */}
      {myReceivedReview && (
        <div className="mt-8 border-t pt-5">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            🌟 Review from Host
          </h2>
          <div className="border rounded-lg bg-gray-50 p-4 text-sm">
            <p className="font-medium text-gray-700">
              ⭐ {myReceivedReview.rating ?? "-"} —{" "}
              {myReceivedReview.content || "No comment"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              from: {myReceivedReview.fromUserNickname || "Host"}
            </p>
          </div>
        </div>
      )}

      {/* 평균 별점 */}
      {avgRating && (
        <div className="flex justify-center items-center gap-2 mb-6 text-yellow-500 text-lg">
          <span>⭐ {avgRating}</span>
          <span className="text-gray-500 text-sm">({reviews.length} Reviews)</span>
        </div>
      )}

      {myReceivedReview ? (
        // ✅ 이미 호스트 리뷰가 존재 → 리뷰 작성 종료 상태
        <div className="mt-6 border-t pt-5 text-center">
          <p className="text-gray-700 font-medium mb-2">
            🎉 The host has reviewed you. Your review cycle is complete!
          </p>
          <p className="text-sm text-gray-500 mb-4">
            You cannot edit or write a new review for this meetup.
          </p>
          <button
            onClick={() => router.push(`/meetups/${meetupId}`)}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Back to Meetup
          </button>
        </div>
      ) : (
        <>
          {/* 별점 선택 */}
          <div className="flex justify-center sm:justify-start gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl sm:text-2xl transition-colors ${
                  rating >= star ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          {/* 코멘트 */}
          <textarea
            placeholder="Write a short comment..."
            className="w-full border border-gray-200 rounded-xl p-3 mb-4 resize-none text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* 제출 다이얼로그 */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit your review?</AlertDialogTitle>
                <AlertDialogDescription>
                  Once submitted, your review cannot be edited.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
