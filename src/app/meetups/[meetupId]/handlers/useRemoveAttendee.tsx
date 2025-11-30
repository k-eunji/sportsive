// src/app/meetups/[meetupId]/handlers/useRemoveAttendee.tsx

"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import type { MeetupWithEvent } from "@/types/event";

export function useRemoveAttendee(
  meetup: MeetupWithEvent | null,
  setMeetup: React.Dispatch<React.SetStateAction<MeetupWithEvent | null>>
) {
  const handleRemoveAttendee = useCallback(
    async (userId: string) => {
      if (!confirm("Are you sure you want to remove this attendee?")) return;

      const removedUser = meetup?.participantsDetailed?.find((a) => a.id === userId);
      let undoClicked = false;

      try {
        const res = await fetch(`/api/meetups/${meetup?.id}/attendees/${userId}`, {
          method: "DELETE",
          headers: { "x-initiator": "host" },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to remove attendee");

        // 로컬 상태 즉시 반영
        setMeetup((prev) =>
          prev
            ? ({
                ...prev,
                participantsDetailed: prev.participantsDetailed?.filter((a) => a.id !== userId),
                participants: prev.participants?.filter((id) => id !== userId),
                participantsCount: Math.max((prev.participantsCount || 1) - 1, 0),
              } as MeetupWithEvent)
            : prev
        );

        // ✅ Toast with Undo
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-in fade-in" : "animate-out fade-out"
              } flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm`}
            >
              <span className="text-gray-800 text-sm">🚮 Attendee removed</span>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
                onClick={async () => {
                  undoClicked = true;
                  toast.dismiss(t.id);

                  if (!removedUser) return;

                  await fetch(`/api/meetups/${meetup?.id}/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: removedUser.id }),
                    cache: "no-store",
                  });

                  const refreshed = await fetch(`/api/meetups/${meetup?.id}`, {
                    cache: "no-store",
                  });

                  if (refreshed.ok) {
                    const data = await refreshed.json();
                    setMeetup(data);
                    toast.success(`${removedUser.name} has been restored`);

                    // 🟢 [추가] 참석자에게 알림 보내기
                    try {
                      await fetch("/api/notifications", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: removedUser.id, // 알림 받을 사람
                          fromUserId: meetup?.hostId, // 보낸 사람(호스트)
                          type: "meetup_undo_remove",
                          message: `✅ The host has undone your removal. You're back in the meetup!`,
                          meetupId: meetup?.id,
                        }),
                      });
                    } catch (err) {
                      console.error("⚠️ Failed to send undo notification:", err);
                    }
                  }
                }}
              >
                Undo
              </button>
            </div>
          ),
          { duration: 5000 }
        );

        setTimeout(() => {
          if (!undoClicked) toast.success("Attendee permanently removed");
        }, 5000);
      } catch (error) {
        console.error("❌ Failed to remove attendee:", error);
        toast.error("Failed to remove attendee.");
      }
    },
    [meetup, setMeetup]
  );

  return { handleRemoveAttendee };
}
