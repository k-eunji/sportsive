// src/app/api/meetups/[meetupId]/attendees/[userId]/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendNotification } from "@/lib/sendNotification";

interface MeetupParams {
  meetupId: string;
  userId: string;
}

export async function DELETE(
  req: Request,
  { params }: { params: MeetupParams }
) {
  const { meetupId, userId } = params; // ← 여기 타입 완전 정상

  try {
    const ref = adminDb.collection("meetups").doc(meetupId);
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

    // 알림: 요청자가 host인지 user인지 구분
    const initiator = req.headers.get("x-initiator");

    if (initiator === "host") {
      // 호스트가 강퇴
      await sendNotification({
        userId, // 강퇴당한 사람에게 알림
        fromUserId: data.hostId,
        meetupId,
        message: "You were removed from the meetup by the host",
        type: "removed",
      });
    } else {
      // 참가자가 스스로 나감
      await sendNotification({
        userId: data.hostId, // 호스트에게 알림
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
