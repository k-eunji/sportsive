// src/app/api/meetups/[meetupId]/reviews/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { rewardUser } from "@/lib/reward";
import { sendNotification } from "@/lib/sendNotification";

// ✅ Next.js 15에서는 params가 Promise로 전달됨
export async function GET(
  req: Request,
  context: { params: Promise<{ meetupId: string }> }
) {
  const { meetupId } = await context.params; // ✅ await 필요
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType");

  try {
    // ✅ 모든 리뷰 불러오기 (targetType 지정 시만 필터)
    let query = db.collection("reviews").where("meetupId", "==", meetupId);
    if (targetType && targetType !== "all") {
      query = query.where("targetType", "==", targetType);
    }

    const snap = await query.orderBy("createdAt", "desc").get();
    const reviews = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // ✅ 닉네임이 없는 리뷰라면 users 컬렉션에서 보충
    const enrichedReviews = await Promise.all(
      reviews.map(async (r: any) => { // ✅ 여기 추가
        if ((!r.fromUserNickname || r.fromUserNickname === "Anonymous") && r.fromUserId) {
          try {
            const userDoc = await db.collection("users").doc(r.fromUserId).get();
            const u = userDoc.exists ? userDoc.data() : null;
            return {
              ...r,
              fromUserNickname:
                u?.authorNickname ||
                u?.nickname ||
                u?.displayName ||
                "Anonymous",
            };
          } catch {
            return { ...r, fromUserNickname: "Anonymous" };
          }
        }
        return r;
      })
    );

    return NextResponse.json(enrichedReviews);
  } catch (error) {
    console.error("❌ Failed to fetch reviews:", error);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ meetupId: string }> }
) {
  const { meetupId } = await context.params; // ✅ await 필요

  try {
    const body = await req.json();
    const { userId, targetUserId, content, rating, targetType } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ 밋업 확인
    const meetupRef = db.collection("meetups").doc(meetupId);
    const meetupSnap = await meetupRef.get();
    if (!meetupSnap.exists) {
      return NextResponse.json(
        { error: "Meetup not found" },
        { status: 404 }
      );
    }

    const meetup = meetupSnap.data()!;  
    const participants: string[] = meetup.participants || [];
    const isHost = meetup.hostId === userId;
    const isParticipant = participants.includes(userId);

    if (!isHost && !isParticipant) {
      return NextResponse.json(
        { error: "Not part of this meetup" },
        { status: 403 }
      );
    }

    if (isParticipant && targetUserId !== meetup.hostId) {
      return NextResponse.json(
        { error: "You can only review the host" },
        { status: 403 }
      );
    }

    if (isHost && !participants.includes(targetUserId)) {
      return NextResponse.json(
        { error: "Invalid review target" },
        { status: 403 }
      );
    }

    // ✅ 리뷰 가능 시점 (1시간 이후)
    const eventDate = new Date(meetup.datetime);
    const now = new Date();
    const diffHours = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) {
      return NextResponse.json(
        { error: "Reviews not open yet" },
        { status: 403 }
      );
    }

    // ✅ 중복 리뷰 방지
    let query = db
      .collection("reviews")
      .where("meetupId", "==", meetupId)
      .where("fromUserId", "==", userId);

    if (targetUserId) query = query.where("targetUserId", "==", targetUserId);
    else query = query.where("targetUserId", "==", null);

    const existingSnap = await query.limit(1).get();
    if (!existingSnap.empty) {
      return NextResponse.json(
        { error: "You already wrote a review for this meetup." },
        { status: 400 }
      );
    }

    // ✅ 닉네임 불러오기
    const userSnap = await db.collection("users").doc(userId).get();
    const userData = userSnap.exists ? userSnap.data() : {};

    // 🔎 테스트 로그 추가
    console.log("🔎 [REVIEW DEBUG] userId:", userId);
    console.log("🔎 [REVIEW DEBUG] userData:", userData);
    
    const nickname =
      userData?.authorNickname ||
      userData?.nickname ||
      userData?.username ||
      userData?.displayName ||
      "Anonymous";

    // ✅ 리뷰 저장
    // ✅ 항상 명확하게 대상 지정 (참가자→호스트 / 호스트→참가자)
    const newReview = {
      meetupId,
      fromUserId: userId,
      fromUserNickname: nickname,
      targetUserId:
        targetUserId ?? (isParticipant ? meetup.hostId : targetUserId),
      // ✅ targetType을 명확하게 지정
      targetType: isHost ? "user" : "user",  // 호스트든 참가자든 "user" 로
      content: content.trim(),
      rating: rating ?? null,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("reviews").add(newReview);
    await rewardUser(userId, "WRITE_REVIEW");

    // ✅ 알림
    if (isParticipant && targetUserId === meetup.hostId) {
      await sendNotification({
        userId: meetup.hostId,
        fromUserId: userId,
        meetupId,
        message: "left a review on your meetup 🎉",
        type: "review_received",
      });
    }

    if (isHost && targetUserId) {
      await sendNotification({
        userId: targetUserId,
        fromUserId: userId,
        meetupId,
        message: "The host has written a review for you.",
        type: "review_reply",
        link: `/meetups/${meetupId}/review`,
      });
    }

    console.log("✅ Review + Notification created:", ref.id);
    return NextResponse.json({ id: ref.id, ...newReview });
  } catch (error) {
    console.error("🔥 Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
