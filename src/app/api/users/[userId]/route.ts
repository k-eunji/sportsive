// src/app/api/users/[userId]/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { getLevel } from "@/lib/levels";

export async function GET(
  _req: Request,
  context:
    | { params: { userId: string } }
    | { params: Promise<{ userId: string }> }
) {
  // ✅ Promise / 객체 모두 처리
  const rawParams = (context as any).params;
  const { userId } =
    typeof rawParams.then === "function" ? await rawParams : rawParams;

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const data = userDoc.data() || {};
    const points = data.points ?? 0;
    const levelInfo = getLevel(points);

    // ✅ 호스트 / 참가 밋업 정보
    const meetupsRef = db.collection("meetups");
    const [hostedSnap, joinedSnap] = await Promise.all([
      meetupsRef.where("hostId", "==", userId).get(),
      meetupsRef.where("participants", "array-contains", userId).get(),
    ]);

    const safeMeetup = (m: any) => ({
      id: m.id,
      title: m.title || "Untitled Meetup",
      datetime:
        m.datetime && m.datetime.toDate
          ? m.datetime.toDate().toISOString()
          : m.datetime || null,
      location: m.location || null,
      imageUrl: m.imageUrl || null,
      type: m.type || "unknown",
      participantsCount: m.participants?.length || 0,
      teamType: m.teamType || "neutral",
      fee: m.fee || 0,
    });

    const hostedMeetups = hostedSnap.docs.map((d) => safeMeetup(d.data()));
    const joinedMeetups = joinedSnap.docs.map((d) => safeMeetup(d.data()));

    // ✅ 리뷰
    const reviewsSnap = await db
      .collection("reviews")
      .where("targetUserId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const reviews = await Promise.all(
      reviewsSnap.docs.map(async (doc) => {
        const rData = doc.data();
        let reviewerName = "Anonymous";
        try {
          const reviewerDoc = await db
            .collection("users")
            .doc(rData.fromUserId)
            .get();
          if (reviewerDoc.exists) {
            const rd = reviewerDoc.data()!;
            reviewerName =
              rd.displayName || rd.username || rd.authorNickname || "Anonymous";
          }
        } catch {}
        return {
          id: doc.id,
          reviewer: reviewerName,
          rating: rData.rating ?? null,
          comment: rData.content ?? "",
          createdAt: rData.createdAt,
          meetupId: rData.meetupId,
        };
      })
    );

    // ✅ 관계 기반 카운트 계산
    // supportersCount: 나를 support하는 유저 수
    // teammatesCount: 나와 mutual 관계인 유저 수
    const usersSnap = await db.collection("users").get();
    let supportersCount = 0;
    let teammatesCount = 0;

    usersSnap.forEach((doc) => {
      const u = doc.data();
      const supports: string[] = u.supporting || [];
      if (supports.includes(userId)) {
        supportersCount++;
        // 상대방도 나를 support하면 팀메이트
        const mySupports: string[] = data.supporting || [];
        if (mySupports.includes(doc.id)) teammatesCount++;
      }
    });

    return NextResponse.json({
      id: userId,
      displayName:
        data.displayName || data.authorNickname || data.username || "Anonymous",
      authorNickname: data.authorNickname || "",
      nickname: data.nickname || "",
      username: data.username || "",
      photoURL: data.photoURL || data.avatar || null,
      bio: data.bio || "",
      region: data.region || "",
      sports: data.sports || [],
      email: data.email || "",
      createdAt: data.createdAt || null,
      points,
      level: levelInfo.name,
      levelDesc: levelInfo.desc,
      levelColor: levelInfo.color,
      hostedMeetups,
      joinedMeetups,
      reviews,
      // ✅ 추가된 실제 수치
      supportersCount,
      teammatesCount,
    });
  } catch (err) {
    console.error("❌ Error fetching user info:", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
