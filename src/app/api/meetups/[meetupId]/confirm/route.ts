// src/app/api/meetups/[meetupId]/confirm/route.ts
import { NextResponse } from "next/server";
import { adminDB, adminAuth } from "@/lib/firebaseAdmin";
import { rewardUser } from "@/lib/reward";

export async function POST(
  req: Request,
  { params }: { params: { meetupId: string } }
) {
  try {
    const { meetupId } = params;
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    await adminAuth.verifyIdToken(idToken);

    const meetupRef = adminDB.collection("meetups").doc(meetupId);
    const meetupSnap = await meetupRef.get();

    if (!meetupSnap.exists) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const meetup = meetupSnap.data()!;

    if (meetup.status === "confirmed") {
      return NextResponse.json({ message: "Already confirmed" });
    }

    // 참가자 최소 조건
    if ((meetup.participants?.length ?? 0) < 3) {
      return NextResponse.json({ error: "Not enough participants" }, { status: 400 });
    }

    // 상태 변경
    await meetupRef.update({
      status: "confirmed",
      confirmedAt: new Date().toISOString(),
    });

    // 보상 지급
    const reward = await rewardUser(meetup.hostId, "HOST_MEETUP");

    console.log(
      `🏅 Meetup ${meetupId} confirmed — host rewarded +${reward.delta} pts`
    );

    return NextResponse.json({ success: true, reward });
  } catch (err: any) {
    console.error("🔥 Meetup confirm failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to confirm meetup" },
      { status: 500 }
    );
  }
}
