// src/app/meetups/[meetupId]/components/MeetupBottomBar.tsx

// src/app/meetups/[meetupId]/components/MeetupBottomBar.tsx
"use client";

import { Share2, Bookmark, Users, MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMessagePopup } from "@/context/MessagePopupContext";
import { useUser } from "@/context/UserContext";
import useScrollDirection from "@/hooks/useScrollDirection";

interface Attendee {
  id: string;
  name: string;
  avatar?: string;
}

interface Props {
  fee?: number | "";
  onAttend: () => void;
  onCancelAttend?: () => void;
  participantsCount?: number;
  participantsAvatars?: string[];
  isHost?: boolean;
  isAttendee?: boolean;
  attendees?: Attendee[];
  onRemoveAttendee?: (userId: string) => void;
  eventDate?: string;
  applicationDeadline?: string;
}

export default function MeetupBottomBar({
  fee,
  onAttend,
  onCancelAttend,
  participantsCount = 0,
  participantsAvatars = [],
  isHost = false,
  isAttendee = false,
  attendees = [],
  onRemoveAttendee,
  eventDate,
  applicationDeadline,
}: Props) {
  const router = useRouter();
  const { user } = useUser();
  const params = useParams();
  const meetupId = params?.meetupId as string;

  const direction = useScrollDirection(); // ⭐ 스크롤 방향 감지

  const [showManageModal, setShowManageModal] = useState(false);
  const { open } = useMessagePopup();

  const handleMessageClick = (userId: string) => {
    open(userId);
    setShowManageModal(false);
  };

  /** 날짜 상태 계산 */
  const getDDay = (eventDateStr?: string, deadlineStr?: string) => {
    if (!eventDateStr) return "";
    const now = new Date();
    const eventDate = new Date(eventDateStr);
    const deadline = deadlineStr ? new Date(deadlineStr) : null;

    const localEventDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000);
    const localDeadline = deadline
      ? new Date(deadline.getTime() - deadline.getTimezoneOffset() * 60000)
      : null;

    if (localDeadline && now >= localDeadline) return "Closed";
    if (!localDeadline && now >= localEventDate) return "Closed";
    const hoursSinceEvent = (now.getTime() - localEventDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceEvent >= 12) return "Expired";
    const diffDays = Math.floor((localEventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 1 ? "D-Day" : `D-${diffDays}`;
  };

  const status = getDDay(eventDate, applicationDeadline);
  const isClosedOrExpired = status === "Closed" || status === "Expired";

  const price =
    !fee || fee === 0
      ? "Free"
      : typeof fee === "number"
      ? `£${fee.toLocaleString()}`
      : "Free";

  return (
    <>
      {/* ⭐ Scroll-Reactive Bottom Bar */}
      <div
        className={`
          fixed inset-x-0 bottom-[52px]
          bg-background/90 backdrop-blur-sm
          border-t border-border
          flex justify-between items-center
          px-5 py-3
          shadow-[0_-4px_12px_rgba(0,0,0,0.05)]
          z-[10000] text-foreground

          transition-transform duration-300 ease-out
          ${direction === "down" ? "translate-y-full" : "translate-y-0"}
        `}
      >

        {/* 참가자 아바타 */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {participantsAvatars.slice(0, 3).map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`participant-${i}`}
                className="w-7 h-7 rounded-full border-2 border-background object-cover"
              />
            ))}
            {participantsCount > 3 && (
              <span className="text-xs text-muted-foreground ml-2">
                +{participantsCount - 3}
              </span>
            )}
          </div>
        </div>

        {/* 중앙 버튼 */}
        <div className="absolute left-1/2 -translate-x-1/2">
          {isHost ? (
            <button
              onClick={() => setShowManageModal(true)}
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition shadow-md flex items-center gap-2"
            >
              <Users size={16} /> Manage Attendees
            </button>
          ) : isAttendee ? (
            isClosedOrExpired ? (
              <span className="px-6 py-2 rounded-full bg-muted text-foreground/70 font-semibold text-sm select-none">
                Joined ✅
              </span>
            ) : (
              <button
                onClick={onCancelAttend}
                className="px-6 py-2 rounded-full bg-destructive text-destructive-foreground font-semibold text-sm hover:opacity-90 transition shadow-md"
              >
                Cancel Attendance
              </button>
            )
          ) : status === "Closed" ? (
            <span className="px-8 py-2 rounded-full bg-muted text-muted-foreground font-semibold text-sm select-none">
              Closed
            </span>
          ) : status === "Expired" ? (
            <span className="px-8 py-2 rounded-full bg-muted text-muted-foreground font-semibold text-sm select-none">
              Ended
            </span>
          ) : (
            <button
              onClick={onAttend}
              className="px-8 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition shadow-md"
            >
              Attend
            </button>
          )}
        </div>

        {/* 우측 아이콘 */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Bookmark size={18} />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* 참여자 관리 모달 */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[2000]">
          <div className="bg-background rounded-2xl p-6 w-96 shadow-xl relative border border-border">
            <h2 className="text-lg font-semibold mb-4">Manage Attendees</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {attendees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendees yet</p>
              ) : (
                attendees.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between hover:bg-muted/40 rounded-lg px-2 py-1 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={a.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                        alt={a.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{a.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMessageClick(a.id)}
                        title="Send message"
                        className="p-1 text-muted-foreground hover:text-primary transition"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button
                        onClick={() => onRemoveAttendee?.(a.id)}
                        title="Remove attendee"
                        className="p-1 text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowManageModal(false)}
              className="w-full mt-5 py-2 bg-muted hover:bg-muted/70 rounded-full text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
