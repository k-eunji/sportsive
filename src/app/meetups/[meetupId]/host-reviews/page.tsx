// src/app/meetups/[meetupId]/host-reviews/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

/**
 * ✅ 호스트 리뷰 관리 페이지
 * - 참가자 목록 + 각 참가자에 대한 리뷰 상태 표시
 * - 호스트가 참가자별로 평가 작성 가능
 * - fetch 캐시 비활성화 (최신 상태 유지)
 */
export default function HostReviewPage() {
  const router = useRouter();
  const { meetupId } = useParams() as { meetupId: string };
  const { user } = useUser();

  const [meetup, setMeetup] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 참가자 닉네임 불러오기
  useEffect(() => {
    const enrichParticipants = async () => {
      if (!meetup?.participants?.length) {
        console.log("⏭️ No participants yet, skipping enrich");
        return;
      }
      console.log("✅ Enriching participants for:", meetup.participants);
      try {
        const detailed = await Promise.all(
          meetup.participants.map(async (id: string) => {
            const res = await fetch(`/api/users/${id}`);
            console.log("🔹 Fetching user:", id, res.status);
            if (!res.ok) return { userId: id, authorNickname: "Anonymous" };
            const user = await res.json();
            console.log("✅ User data:", user);
            return {
              userId: id,
              authorNickname:
                user.authorNickname || user.nickname || user.displayName || "Anonymous",
              displayName: user.displayName || user.authorNickname || "",
            };
          })
        );

        console.log("🎯 Detailed:", detailed);
        setMeetup((prev: any) => ({ ...prev, participantsDetailed: detailed }));
      } catch (err) {
        console.error("❌ Failed to enrich participants:", err);
      }
    };

    enrichParticipants();
  }, [meetup]);

  /** 1️⃣ Meetup 데이터 + 리뷰 데이터 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetupRes, reviewsRes] = await Promise.all([
          fetch(`/api/meetups/${meetupId}`, { cache: "no-store" }),
          fetch(`/api/meetups/${meetupId}/reviews`, { cache: "no-store" }),
        ]);

        if (meetupRes.ok) setMeetup(await meetupRes.json());
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
      } catch (err) {
        console.error("❌ Failed to load data:", err);
      }
    };

    fetchData();
  }, [meetupId]);

  /** 2️⃣ 참가자별 리뷰 여부 확인 */
  const hasReviewed = useCallback(
    (participantId: string) => {
      return reviews.some(
        (r) =>
          r.fromUserId === user?.userId &&
          r.targetUserId === participantId
      );
    },
    [reviews, user]
  );

  /** 3️⃣ 리뷰 제출 */
  const handleSubmit = async () => {
    if (!selectedUserId) return alert("Please select a participant.");
    if (rating === 0) return alert("Please choose a rating.");

    setLoading(true);
    try {
      const res = await fetch(`/api/meetups/${meetupId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.userId,
          targetUserId: selectedUserId,
          targetType: "user",
          rating,
          content: comment,
        }),
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to submit review");
      const newReview = await res.json();

      setReviews((prev) => [...prev, newReview]);
      setSelectedUserId(null);
      setRating(0);
      setComment("");
      alert("✅ Review submitted successfully!");
    } catch (err) {
      console.error("❌ Error submitting review:", err);
      alert("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  if (!meetup)
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-500">
        Loading meetup info...
      </div>
    );

  const participants = meetup.participantsDetailed || meetup.participants || [];


  if (user?.userId !== meetup.hostId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Access Denied
        </h2>
        <p className="text-gray-500 mb-6">
          Only the host can access participant reviews.
        </p>
        <button
          onClick={() => router.push(`/meetups/${meetupId}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Meetup
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg border">
      <h1 className="text-2xl font-bold mb-6 text-center">
        🧑‍⚖️ Host Review Management
      </h1>

      {/* ✅ 참가자가 남긴 리뷰 (호스트가 받은 리뷰 보기) */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          💬 Reviews from Participants
        </h2>
        {reviews.filter((r) => r.targetUserId === user?.userId).length === 0 ? (
          <p className="text-sm text-gray-500">No reviews from participants yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews
              .filter((r) => r.targetUserId === user?.userId)
              .map((r) => (
                <div
                  key={r.id}
                  className="border rounded-lg p-3 text-sm bg-gray-50"
                >
                  <p className="font-medium text-gray-700">
                    ⭐ {r.rating ?? "-"} — {r.content || "No comment"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    from: {r.fromUserNickname || r.fromUserId}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ✅ 참가자 목록 + 평가 섹션 (호스트가 평가 남기기) */}
      <div className="space-y-3 mb-6">
        {participants.length === 0 ? (
          <p className="text-gray-500 text-center">No participants joined yet.</p>
        ) : (
          participants.map((p: any) => {
            const reviewed = hasReviewed(p.userId || p);
            return (
              <div
                key={p.userId || p}
                className={`flex items-center justify-between border rounded-lg px-4 py-3 ${
                  selectedUserId === (p.userId || p)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {p.authorNickname?.trim() || p.displayName?.trim() || p.userId || "Anonymous"}
                  </p>
                  {reviewed ? (
                    <p className="text-xs text-green-600">✅ Reviewed</p>
                  ) : (
                    <p className="text-xs text-gray-400">Not reviewed</p>
                  )}
                </div>
                <button
                  onClick={() =>
                    setSelectedUserId(
                      selectedUserId === (p.userId || p) ? null : p.userId || p
                    )
                  }
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {selectedUserId === (p.userId || p) ? "Cancel" : "Review"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 리뷰 작성 폼 (기존과 동일) */}
      {selectedUserId && (
        <div className="border-t pt-5 mt-5">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Leave a review for participant
          </h2>

          {/* 별점 */}
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className={`text-2xl transition ${
                  rating >= s ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a short comment..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg p-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      <button
        onClick={() => router.push(`/meetups/${meetupId}`)}
        className="w-full mt-8 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
      >
        Back to Meetup
      </button>
    </div>
  );
}