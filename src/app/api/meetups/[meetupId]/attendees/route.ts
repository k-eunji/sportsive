// src/app/api/meetups/[meetupId]/attendees/route.ts

import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { sendNotification } from "@/lib/sendNotification";

export async function POST(req: Request, { params }: { params: { meetupId: string } }) {
  const { meetupId } = params;
  const { userId } = await req.json();

  try {
    const ref = adminDB.collection("meetups").doc(meetupId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const meetup = snap.data()!;
    const participants: string[] = meetup.participants || [];

    if (participants.includes(userId)) {
      return NextResponse.json({ error: "Already joined" }, { status: 400 });
    }

    const updatedParticipants = [...participants, userId];

    await ref.update({
      participants: updatedParticipants,
      participantsCount: updatedParticipants.length,
      updatedAt: new Date().toISOString(),
    });

    await sendNotification({
      userId: meetup.hostId,
      fromUserId: userId,
      meetupId,
      message: "joined your meetup!",
      type: "join",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 Error joining meetup:", err);
    return NextResponse.json({ error: "Failed to join meetup" }, { status: 500 });
  }
}
