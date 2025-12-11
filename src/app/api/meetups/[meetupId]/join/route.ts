// src/app/api/meetups/[meetupId]/join/route.ts

import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { sendNotification } from "@/lib/sendNotification";

export async function POST(
  req: Request,
  context: { params: Promise<{ meetupId: string }> }
) {
  const { meetupId } = await context.params; // ⬅️ Next.js 16 필수 await

  try {
    const body = await req.json();
    const { userId } = body ?? {};

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const meetupRef = adminDB.collection("meetups").doc(meetupId);
    const docSnap = await meetupRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const data = docSnap.data()!;
    const participants = new Set<string>(data.participants || []);

    if (participants.has(userId)) {
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

    // 호스트에게 알림 (본인이 아닐 때)
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
