// src/app/api/meetups/[meetupId]/join/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { sendNotification } from "@/lib/sendNotification";

// ✅ POST — 밋업 참가 요청
export async function POST(
  req: Request,
  context: { params: Promise<{ meetupId: string }> } // ✅ Promise 타입으로 변경
) {
  const { meetupId } = await context.params; // ✅ await 필요

  try {
    const body = await req.json();
    const { userId } = body ?? {};

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const meetupRef = db.collection("meetups").doc(meetupId);
    const docSnap = await meetupRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const data = docSnap.data()!;
    const participants = new Set<string>(data.participants || []);
    const alreadyJoined = participants.has(userId);

    // ✅ 이미 참가한 경우
    if (alreadyJoined) {
      return NextResponse.json({
        ok: true,
        message: "Already joined",
      });
    }

    participants.add(userId);

    await meetupRef.update({
      participants: Array.from(participants),
      participantsCount: participants.size,
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ User ${userId} joined meetup ${meetupId}`);

    // ✅ 호스트에게 알림 (본인 아닐 때만)
    if (data.hostId && userId !== data.hostId) {
      await sendNotification({
        userId: data.hostId,
        fromUserId: userId,
        meetupId,
        message: "joined your meetup",
        type: "join",
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Joined successfully",
      count: participants.size,
    });
  } catch (error) {
    console.error("🔥 Error joining meetup:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to join meetup",
      },
      { status: 500 }
    );
  }
}
