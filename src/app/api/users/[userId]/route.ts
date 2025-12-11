// src/app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getLevel } from "@/lib/levels";

interface RouteParams {
  params: { userId: string };
}

export async function GET(
  _req: NextRequest,
  context: Promise<{ params: { userId: string } }>
) {
  const { params } = await context;
  const { userId } = params;

  try {
    // -------------------------------------
    // 🔥 사용자 기본 정보
    // -------------------------------------
    const userSnap = await db.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data() ?? {};
    const points = userData.points ?? 0;
    const level = getLevel(points);

    // -------------------------------------
    // 🔥 호스트 & 참가 밋업 정보
    // -------------------------------------
    const meetupsRef = db.collection("meetups");

    const [hostedSnap, joinedSnap] = await Promise.all([
      meetupsRef.where("hostId", "==", userId).get(),
      meetupsRef.where("participants", "array-contains", userId).get(),
    ]);

    const formatMeetup = (m: any, id: string) => ({
      id,
      title: m.title ?? "Untitled Meetup",
      datetime:
        m.datetime?.toDate?.() instanceof Date
          ? m.datetime.toDate().toISOString()
          : m.datetime ?? null,
      location: m.location ?? null,
      imageUrl: m.imageUrl ?? null,
      type: m.type ?? "unknown",
      participantsCount: m.participants?.length ?? 0,
      teamType: m.teamType ?? "neutral",
      fee: m.fee ?? 0,
    });

    const hostedMeetups = hostedSnap.docs.map((d) =>
      formatMeetup(d.data(), d.id)
    );
    const joinedMeetups = joinedSnap.docs.map((d) =>
      formatMeetup(d.data(), d.id)
    );

    // -------------------------------------
    // 🔥 리뷰 정보
    // -------------------------------------
    const reviewsSnap = await db
      .collection("reviews")
      .where("targetUserId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const reviews = await Promise.all(
      reviewsSnap.docs.map(async (doc) => {
        const r = doc.data();
        let reviewerName = "Anonymous";

        try {
          const reviewerSnap = await db
            .collection("users")
            .doc(r.fromUserId)
            .get();

          if (reviewerSnap.exists) {
            const d = reviewerSnap.data()!;
            reviewerName =
              d.displayName ||
              d.username ||
              d.authorNickname ||
              "Anonymous";
          }
        } catch {}

        return {
          id: doc.id,
          reviewer: reviewerName,
          rating: r.rating ?? null,
          comment: r.content ?? "",
          createdAt: r.createdAt,
          meetupId: r.meetupId,
        };
      })
    );

    // -------------------------------------
    // 🔥 supporters / teammates 계산
    // supportersCount: 나를 support한 사람
    // teammatesCount: 서로 support한 사람
    // -------------------------------------
    const allUsersSnap = await db.collection("users").get();

    const mySupports: string[] = userData.supporting ?? [];
    let supportersCount = 0;
    let teammatesCount = 0;

    allUsersSnap.forEach((doc) => {
      const u = doc.data();
      const supports: string[] = u.supporting ?? [];

      if (supports.includes(userId)) {
        supportersCount++;

        if (mySupports.includes(doc.id)) {
          teammatesCount++;
        }
      }
    });

    // -------------------------------------
    // 🔥 응답 구성
    // -------------------------------------
    return NextResponse.json({
      id: userId,
      displayName:
        userData.displayName ||
        userData.authorNickname ||
        userData.username ||
        "Anonymous",
      authorNickname: userData.authorNickname ?? "",
      nickname: userData.nickname ?? "",
      username: userData.username ?? "",
      photoURL: userData.photoURL ?? userData.avatar ?? null,
      bio: userData.bio ?? "",
      region: userData.region ?? "",
      sports: userData.sports ?? [],
      email: userData.email ?? "",
      createdAt: userData.createdAt ?? null,

      // 레벨
      points,
      level: level.name,
      levelDesc: level.desc,
      levelColor: level.color,

      // 밋업
      hostedMeetups,
      joinedMeetups,

      // 리뷰
      reviews,

      // 관계
      supportersCount,
      teammatesCount,
    });
  } catch (err) {
    console.error("❌ Error fetching user info:", err);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
