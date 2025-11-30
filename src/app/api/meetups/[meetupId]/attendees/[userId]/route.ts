// src/app/api/meetups/[meetupId]/attendees/[userId]/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { sendNotification } from "@/lib/sendNotification";

interface MeetupParams {
  meetupId: string;
  userId: string;
}

// ✅ DELETE — 사용자가 밋업에서 나가기 / 호스트가 참석자 강퇴
export async function DELETE(
  req: Request,
  { params }: { params: { meetupId: string; userId: string } } // ✅ Promise ❌, 그냥 객체 ✅
) {
  const { meetupId, userId } = params as { meetupId: string; userId: string }; // 빨간줄 사라짐 ✅

  try {
    const ref = db.collection("meetups").doc(meetupId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Meetup not found" },
        { status: 404 }
      );
    }

    const data = snap.data()!;
    const oldParticipants: string[] = data.participants || [];

    if (!oldParticipants.includes(userId)) {
      return NextResponse.json(
        { error: "User not in participant list" },
        { status: 400 }
      );
    }

    const newParticipants = oldParticipants.filter((id) => id !== userId);
    const newCount = newParticipants.length;
    const shouldUnconfirm = newCount < 2;

    await ref.update({
      participants: newParticipants,
      participantsCount: newCount,
      confirmed: shouldUnconfirm ? false : data.confirmed,
      updatedAt: new Date().toISOString(),
    });

    console.log(`🚪 User ${userId} left meetup ${meetupId}`);

    // ✅ 알림 로직 처리
    const initiator = req.headers.get("x-initiator");

    if (initiator === "host") {
      // ✅ 호스트가 강퇴한 경우
      await sendNotification({
        userId, // ✅ toUserId → userId
        fromUserId: data.hostId,
        meetupId,
        message: "You were removed from the meetup by the host",
        type: "removed",
      });

    } else {
      // ✅ 참석자가 스스로 나간 경우
      await sendNotification({
        userId: data.hostId, // ✅
        fromUserId: userId,
        meetupId,
        message: "canceled attendance",
        type: "cancel",
      });

    }

    return NextResponse.json({
      success: true,
      message: shouldUnconfirm
        ? "Left meetup. Meetup no longer confirmed."
        : "Left meetup successfully.",
    });
  } catch (error) {
    console.error("🔥 Error leaving meetup:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to leave meetup",
      },
      { status: 500 }
    );
  }
}
