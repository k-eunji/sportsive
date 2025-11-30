// src/app/meetups/[meetupId]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useMeetupData } from "./hooks/useMeetupData";
import { useMeetupReviewStatus } from "./hooks/useMeetupReviewStatus";
import { useAttendanceHandlers } from "./handlers/useAttendanceHandlers";
import { useRemoveAttendee } from "./handlers/useRemoveAttendee";

import MeetupHeader from "./components/MeetupHeader";
import MeetupInfoCard from "./components/MeetupInfoCard";
import MeetupEventCard from "./components/MeetupEventCard";
import MeetupParticipants from "./components/MeetupParticipants";
import MeetupComments from "./components/MeetupComments";
import MeetupHostCard from "./components/MeetupHostCard";
import MapSection from "./components/MapSection";
import MeetupBottomBar from "./components/MeetupBottomBar";
import MeetupAboutSection from "./components/MeetupAboutSection";
import { useEffect, useState } from "react"; // ⬅️ 추가
import { useHostReviewStatus } from "./hooks/useHostReviewStatus";

/**
 * ✅ Next.js 15 + Tailwind 4 환경에 맞춘 Meetup 상세 페이지
 * - fetch 캐싱 비활성화
 * - Tailwind 4 클래스 구조 및 반응형 스타일 정리
 * - 로딩/에러/참석자 상태에 따른 UI 분기 명확화
 */
export default function MeetupDetailPage() {
  const { meetupId } = useParams() as { meetupId: string };
  const router = useRouter();
  const { user } = useUser();

  const { meetup, setMeetup, loading } = useMeetupData(meetupId);
  const { hasReviewed } = useMeetupReviewStatus(meetupId, user, meetup);

  const { handleAttend, handleCancelAttend } = useAttendanceHandlers(meetup, setMeetup, user);
  const { handleRemoveAttendee } = useRemoveAttendee(meetup, setMeetup);
  const [canReview, setCanReview] = useState(false);
  const { hostReview } = useHostReviewStatus(meetupId, user?.userId || null);


  // ✅ 모임 종료 1시간 후 자동 알람 + 버튼 표시
  useEffect(() => {
    if (!meetup?.datetime || !user) return;

    const isAttendee = meetup.participants?.includes?.(user.userId);
    if (!isAttendee) return;

    const eventTime = new Date(meetup.datetime).getTime();
    const now = Date.now();
    const delay = eventTime + 60 * 60 * 1000 - now; // 1시간 후 시점 계산

    // 이미 1시간 지난 경우 → 즉시 표시
    if (delay <= 0) {
      setCanReview(true);
      return;
    }

    // ⏰ 아직 1시간 안 됨 → 1시간 뒤 자동으로 알람 + 버튼 표시
    const timer = setTimeout(() => {
      setCanReview(true);
      alert("🕒 It's time to leave your review!"); // 영어 UI, 한글 설명
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Review available!", {
          body: "You can now write a review for this meetup.",
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [meetup, user]);

  // ✅ Notification 권한 요청 (처음 진입 시 1회)
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  /** ✅ 로딩 중 */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-400 text-lg">
        Loading meetup...
      </div>
    );
  }

  /** ✅ Meetup 존재하지 않음 */
  if (!meetup) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Meetup not found</h2>
        <button
          onClick={() => router.push("/meetups")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Meetups
        </button>
      </div>
    );
  }

  /** ✅ 유저 상태 판별 */
  const isHost = !!user && (user.userId === meetup.hostId || meetup.hostId?.includes(user.userId));
  const isAttendee = !!user && (meetup.participants?.includes?.(user.userId) ?? false);

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-4">

      {/* Header */}
      <MeetupHeader meetup={meetup} />

      <section className="space-y-4">
        {/* 기본 정보 */}
        <MeetupInfoCard meetup={meetup} />
        <MeetupAboutSection meetup={meetup} />

        {/* 이벤트 카드 */}
        {meetup.event && (
          <MeetupEventCard
            event={meetup.event}
            meetupId={meetup.id}
            isHost={isHost}
            teamType={
              (["home", "away"] as const).includes(meetup.teamType as any)
                ? (meetup.teamType as "home" | "away")
                : undefined
            }
            upcomingEvents={meetup.upcomingEvents || []}
          />
        )}

        {/* 지도 (오프라인만) */}
        {meetup.type !== "online_game" && meetup.location && (
          <MapSection
            lat={meetup.location?.lat ?? 0}
            lng={meetup.location?.lng ?? 0}
            locationName={meetup.location?.name ?? "Unknown"}
            address={meetup.location?.address ?? ""}
            datetime={meetup.datetime}
            findUsNote={meetup.findUsNote}
            meetupId={meetup.id}
            isHost={isHost}
          />
        )}

        {/* 호스트 + 참가자 */}
        <div className="grid md:grid-cols-2 gap-6">
          <MeetupHostCard hostId={meetup.hostId} />
          <MeetupParticipants meetup={meetup} />
        </div>

        {/* 댓글 */}
        <MeetupComments meetupId={meetup.id} />

        {/* 리뷰 버튼 */}
        {/* 리뷰 버튼 / 호스트 평가 보기 */}
        {canReview && (
          hasReviewed ? (
            hostReview ? (
              // ✅ 참가자가 리뷰를 남겼고, 호스트가 나에게 평가를 남긴 경우
              <button
                onClick={() => router.push(`/meetups/${meetup.id}/review`)}
                className="w-full mt-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                ⭐ View Host Review
              </button>
            ) : (
              // ✅ 내가 리뷰만 남기고, 호스트는 아직 나를 평가하지 않은 경우
              <button
                disabled
                className="w-full mt-6 py-2 bg-gray-200 text-gray-600 rounded-xl cursor-not-allowed"
              >
                ✅ Review Submitted
              </button>
            )
          ) : (
            // ✅ 아직 내가 리뷰를 작성하지 않은 경우
            <button
              onClick={() => router.push(`/meetups/${meetup.id}/review`)}
              className="w-full mt-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Leave a Review
            </button>
          )
        )}

        {/* 호스트 리뷰 관리 버튼 */}
        {isHost && (
          <button
            onClick={() => router.push(`/meetups/${meetup.id}/host-reviews`)}
            className="w-full mt-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            🧑‍⚖️ Manage Participant Reviews
          </button>
        )}

      </section>

      {/* 하단 참석/취소 바 */}
      <MeetupBottomBar
        fee={meetup.fee}
        onAttend={handleAttend}
        participantsCount={meetup.participantsCount}
        participantsAvatars={meetup.participantsAvatars}
        isHost={isHost}
        isAttendee={isAttendee}
        attendees={meetup.participantsDetailed || []}
        onRemoveAttendee={handleRemoveAttendee}
        eventDate={meetup.datetime}
        applicationDeadline={meetup.applicationDeadline}
        onCancelAttend={handleCancelAttend}
      />
    </main>
  );
}
