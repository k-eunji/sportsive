// src/app/api/meetups/[meetupId]/reviews/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { rewardUser } from "@/lib/reward";
import { sendNotification } from "@/lib/sendNotification";

// ========================================================
// GET — 리뷰 목록 가져오기
// ========================================================
export async function GET(
  req: Request,
  context: { params: Promise<{ meetupId: string }> }
) {
  const { meetupId } = await context.params;
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType");

  try {
    let query = adminDb
      .collection("reviews")
      .where("meetupId", "==", meetupId);

    if (targetType && targetType !== "all") {
      query = query.where("targetType", "==", targetType);
    }

    const snap = await query.orderBy("createdAt", "desc").get();
    const reviews = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 닉네임 보정
    const enriched = await Promise.all(
      reviews.map(async (r: any) => {
        if ((!r.fromUserNickname || r.fromUserNickname === "Anonymous") && r.fromUserId) {
          const userDoc = await adminDb.collection("users").doc(r.fromUserId).get();
          const u = userDoc.exists ? userDoc.data() : null;

          return {
            ...r,
            fromUserNickname:
              u?.authorNickname ||
              u?.nickname ||
              u?.displayName ||
              "Anonymous",
          };
        }
        return r;
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("❌ Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

// ========================================================
// POST — 리뷰 작성
// ========================================================
export async function POST(
  req: Request,
  context: { params: Promise<{ meetupId: string }> }
) {
  const { meetupId } = await context.params;

  try {
    const body = await req.json();
    const { userId, targetUserId, content, rating } = body;

    if (!userId || !content?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // =========================
    // 밋업 존재 여부 확인
    // =========================
    const meetupRef = adminDb.collection("meetups").doc(meetupId);
    const meetupSnap = await meetupRef.get();

    if (!meetupSnap.exists) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const meetup = meetupSnap.data()!;
    const participants: string[] = meetup.participants || [];
    const isHost = meetup.hostId === userId;
    const isParticipant = participants.includes(userId);

    // =========================
    // 리뷰 권한 체크
    // =========================
    if (!isHost && !isParticipant) {
      return NextResponse.json(
        { error: "Not part of this meetup" },
        { status: 403 }
      );
    }

    // 참가자는 호스트만 평가 가능
    if (isParticipant && targetUserId !== meetup.hostId) {
      return NextResponse.json(
        { error: "Participants can only review the host" },
        { status: 403 }
      );
    }

    // 호스트는 참가자만 평가 가능
    if (isHost && !participants.includes(targetUserId)) {
      return NextResponse.json(
        { error: "Host can only review participants" },
        { status: 403 }
      );
    }

    // =========================
    // 리뷰 가능 시점 체크 (1시간 이후)
    // =========================
    const eventDate = new Date(meetup.datetime);
    const now = new Date();
    const diffHours = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      return NextResponse.json(
        { error: "Reviews not open yet" },
        { status: 403 }
      );
    }

    // =========================
    // 중복 리뷰 체크
    // =========================
    const reviewTarget = targetUserId ?? meetup.hostId;

    const existing = await adminDb
      .collection("reviews")
      .where("meetupId", "==", meetupId)
      .where("fromUserId", "==", userId)
      .where("targetUserId", "==", reviewTarget)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { error: "You already wrote a review for this meetup." },
        { status: 400 }
      );
    }

    // =========================
    // 리뷰 작성자 닉네임 가져오기
    // =========================
    const userSnap = await adminDb.collection("users").doc(userId).get();
    const user = userSnap.exists ? userSnap.data() : {};
    const nickname =
      user?.authorNickname ||
      user?.nickname ||
      user?.displayName ||
      "Anonymous";

    // =========================
    // 리뷰 저장
    // =========================
    const newReview = {
      meetupId,
      fromUserId: userId,
      fromUserNickname: nickname,
      targetUserId: reviewTarget,
      targetType: "user",
      content: content.trim(),
      rating: rating ?? null,
      createdAt: new Date().toISOString(),
    };

    const newRef = await adminDb.collection("reviews").add(newReview);

    // 보상 지급
    await rewardUser(userId, "WRITE_REVIEW");

    // =========================
    // 알림 전송
    // =========================
    if (isParticipant) {
      await sendNotification({
        userId: meetup.hostId,
        fromUserId: userId,
        meetupId,
        message: "left a review on your meetup 🎉",
        type: "review_received",
      });
    }

    if (isHost && reviewTarget) {
      await sendNotification({
        userId: reviewTarget,
        fromUserId: userId,
        meetupId,
        message: "The host has written a review for you.",
        type: "review_reply",
        link: `/meetups/${meetupId}/review`,
      });
    }

    console.log("✅ Review created:", newRef.id);

    return NextResponse.json({ id: newRef.id, ...newReview });
  } catch (error) {
    console.error("🔥 Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
