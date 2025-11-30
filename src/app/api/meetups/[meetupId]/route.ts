// src/app/api/meetups/[meetupId]/route.ts

import { NextResponse } from "next/server";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db as clientDb } from "@/lib/firebase";
import { db as adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface MeetupParams {
  meetupId: string;
}

/** GET /api/meetups/[meetupId] */
export async function GET(
  _req: Request,
  { params }: { params: Promise<MeetupParams> } // 👈 Promise로 수정
) {
  const { meetupId } = await params; // 👈 반드시 await 추가

  try {
    const ref = doc(clientDb, "meetups", meetupId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const data = snap.data();

    // ✅ 참가자 상세 정보 불러오기
    const participants: string[] = data.participants || [];
    const participantsDetailed = await Promise.all(
      participants.map(async (uid) => {
        try {
          const userRef = doc(clientDb, "users", uid);
          const userSnap = await getDoc(userRef);
          const user = userSnap.exists() ? userSnap.data() : null;
          return {
            id: uid,
            name:
              user?.displayName ||
              user?.authorNickname ||
              user?.username ||
              "Anonymous",
            avatar: user?.photoURL || user?.avatar || null,
          };
        } catch (err) {
          console.warn("⚠️ Failed to load user:", uid, err);
          return { id: uid, name: "Unknown", avatar: null };
        }
      })
    );

    const participantsAvatars = participantsDetailed
      .filter((p) => !!p.avatar)
      .map((p) => p.avatar);

    // ✅ 이벤트 정보 가져오기
    const targetEventId = data.eventId || data.selectedEventId;
    const baseUrlRaw =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000";

    const baseUrl = baseUrlRaw.endsWith("/api")
      ? baseUrlRaw.replace(/\/api$/, "")
      : baseUrlRaw;

    const eventRes = await fetch(`${baseUrl}/api/events/england/football`, {
      cache: "no-store",
    });

    let eventData: any = null;
    let upcomingEvents: any[] = [];

    if (eventRes.ok) {
      const dataJson = await eventRes.json();
      const matches = dataJson.matches || [];
      eventData = matches.find(
        (m: any) => String(m.id) === String(targetEventId)
      );

      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      upcomingEvents = matches.filter((m: any) => {
        const matchDate = new Date(m.date || m.utcDate);
        return matchDate >= now && matchDate <= nextWeek;
      });
    }

    // ✅ 같은 타이틀의 다른 밋업들
    const relatedQuery = query(
      collection(clientDb, "meetups"),
      where("title", "==", data.title)
    );
    const relatedSnap = await getDocs(relatedQuery);
    const relatedMeetups = relatedSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const location = {
      name: data.location?.name ?? "",
      lat: data.location?.lat ?? 0,
      lng: data.location?.lng ?? 0,
      address: data.location?.address ?? data.address ?? "",
    };

    // ✅ 밋업 종료 후 하루가 지나면 리뷰 자동 오픈 및 알림 발송
    // ✅ 밋업 종료 후 1시간이 지나면 리뷰 자동 오픈 및 알림 발송
    try {
      const now = new Date();
      const meetupDate = new Date(data.datetime);
      const oneHourAfter = new Date(meetupDate.getTime() + 60 * 60 * 1000);

      if (!data.reviewsOpen && now > oneHourAfter) {
        console.log("📢 Auto-opening reviews for meetup:", meetupId);

        // 1️⃣ reviewsOpen 업데이트
        await adminDb.collection("meetups").doc(meetupId).update({
          reviewsOpen: true,
        });
        data.reviewsOpen = true;

        // 2️⃣ 참가자 알림 생성
        const participantIds = data.participants || [];
        if (participantIds.length > 0) {
          const batch = adminDb.batch();
          participantIds.forEach((uid: string) => {
            const ref = adminDb.collection("notifications").doc();
            batch.set(ref, {
              userId: uid, // ✅ toUserId → userId
              meetupId,
              type: "review_prompt", // ✅ 알림 타입 지정
              message: `💬 "${data.title}" meetup has ended! Please leave a review.`,
              read: false, // ✅ isRead → read
              createdAt: new Date().toISOString(),
            });
          });
          await batch.commit();
          console.log(`📨 Sent review reminder to ${participantIds.length} users`);
        }
      }
    } catch (error) {
      console.error("⚠️ Failed to auto-open reviews or send notifications:", error);
    }

    return NextResponse.json(
      {
        id: snap.id,
        ...data,
        reviewsOpen: data.reviewsOpen ?? false,
        participantsCount: participants.length,
        participantsAvatars,
        participantsDetailed,
        location,
        event: eventData || data.event || null,
        upcomingEvents,
        relatedMeetups,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching meetup:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load meetup",
      },
      { status: 500 }
    );
  }
}

/** PATCH /api/meetups/[meetupId] */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<MeetupParams> } // 👈 Promise로 수정
) {
  const { meetupId } = await params; // 👈 await 추가

  try {
    const body = await req.json();
    console.log("🧩 PATCH meetup:", meetupId, body);

    const {
      purpose,
      details,
      location,
      findUsNote,
      title,
      datetime,
      imageUrl,
      fee,
      ageLimit,
      ageFrom,
      ageTo,
      skillLevel,
      sportType,
      onlineLink,
      onlineGameName,
      event,
      eventId,
      teamType,
    } = body;

    if (
      [
        purpose,
        details,
        location,
        findUsNote,
        title,
        datetime,
        imageUrl,
        fee,
        ageLimit,
        ageFrom,
        ageTo,
        skillLevel,
        sportType,
        onlineLink,
        onlineGameName,
        event,
        eventId,
        teamType,
      ].every((v) => v === undefined)
    ) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    Object.assign(updateData, {
      ...(purpose !== undefined && { purpose }),
      ...(details !== undefined && { details }),
      ...(findUsNote !== undefined && { findUsNote }),
      ...(title !== undefined && { title }),
      ...(datetime !== undefined && { datetime }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(fee !== undefined && { fee }),
      ...(ageLimit !== undefined && { ageLimit }),
      ...(ageFrom !== undefined && { ageFrom }),
      ...(ageTo !== undefined && { ageTo }),
      ...(skillLevel !== undefined && { skillLevel }),
      ...(sportType !== undefined && { sportType }),
      ...(onlineLink !== undefined && { onlineLink }),
      ...(onlineGameName !== undefined && { onlineGameName }),
      ...(eventId !== undefined && { eventId }),
      ...(event !== undefined && { event }),
      ...(teamType !== undefined && { teamType }),
    });

    if (location) {
      updateData["location.name"] = location.name;
      updateData["location.lat"] = location.lat;
      updateData["location.lng"] = location.lng;
      if (location.address) updateData["location.address"] = location.address;
    }

    console.log("🔥 Firestore Update Data:", updateData);

    await adminDb.collection("meetups").doc(meetupId).update(updateData);

    return NextResponse.json({
      ok: true,
      message: "Meetup updated successfully",
    });
  } catch (error) {
    console.error("🔥 Error updating meetup:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update meetup",
      },
      { status: 500 }
    );
  }
}

/** DELETE /api/meetups/[meetupId] */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<MeetupParams> } // 👈 Promise로 수정
) {
  const { meetupId } = await params; // 👈 await 추가

  try {
    console.log("🗑️ Deleting meetup:", meetupId);

    if (!meetupId) {
      return NextResponse.json({ error: "Meetup ID required" }, { status: 400 });
    }

    await adminDb.collection("meetups").doc(meetupId).delete();

    return NextResponse.json({
      ok: true,
      message: "Meetup deleted successfully",
    });
  } catch (error) {
    console.error("🔥 Error deleting meetup:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete meetup",
      },
      { status: 500 }
    );
  }
}
