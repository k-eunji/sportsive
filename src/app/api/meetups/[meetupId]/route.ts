// src/app/api/meetups/[meetupId]/route.ts

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

interface MeetupParams {
  meetupId: string;
}

/* ============================================================
   GET /api/meetups/[meetupId]
   밋업 상세 정보 불러오기
============================================================ */
export async function GET(
  _req: Request,
  { params }: { params: Promise<MeetupParams> }
) {
  const { meetupId } = await params;

  try {
    // -----------------------------
    // 1) 밋업 데이터 가져오기
    // -----------------------------
    const snap = await adminDb.collection("meetups").doc(meetupId).get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const data = snap.data()!;

    // -----------------------------
    // 2) 참가자 상세 정보
    // -----------------------------
    const participantIds: string[] = data.participants || [];

    const participantsDetailed = await Promise.all(
      participantIds.map(async (uid) => {
        try {
          const userSnap = await adminDb.collection("users").doc(uid).get();
          const user = userSnap.exists ? userSnap.data() : null;

          return {
            id: uid,
            name:
              user?.displayName ||
              user?.authorNickname ||
              user?.nickname ||
              "Anonymous",
            avatar: user?.photoURL || user?.avatar || null,
          };
        } catch (err) {
          console.warn("⚠️ Failed loading user:", uid, err);
          return { id: uid, name: "Unknown", avatar: null };
        }
      })
    );

    const participantsAvatars = participantsDetailed
      .filter((u) => u.avatar)
      .map((u) => u.avatar);

    // -----------------------------
    // 3) 이벤트 정보 가져오기 (football + rugby)
    // -----------------------------
    const targetEventId = data.eventId || data.selectedEventId;

    const baseUrlRaw =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000";

    const baseUrl = baseUrlRaw.replace(/\/api$/, "");

    let eventData = null;
    let upcomingEvents: any[] = [];

    try {
      const [footballRes, rugbyRes] = await Promise.all([
        fetch(`${baseUrl}/api/events/england/football`, { cache: "no-store" }),
        fetch(`${baseUrl}/api/events/england/rugby`, { cache: "no-store" }),
      ]);

      let allMatches: any[] = [];

      if (footballRes.ok) {
        const json = await footballRes.json();
        allMatches = [...allMatches, ...(json.matches ?? [])];
      }

      if (rugbyRes.ok) {
        const json = await rugbyRes.json();
        allMatches = [...allMatches, ...(json.matches ?? [])];
      }

      // 선택된 이벤트
      eventData = allMatches.find(
        (m: any) => String(m.id) === String(targetEventId)
      );

      // 향후 7일 이벤트
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      upcomingEvents = allMatches.filter((m: any) => {
        const d = new Date(m.date || m.utcDate);
        return d >= now && d <= nextWeek;
      });

    } catch (e) {
      console.error("⚠️ Failed loading event info:", e);
    }

    // -----------------------------
    // 4) 동일한 제목의 다른 밋업들
    // -----------------------------
    const relatedSnap = await adminDb
      .collection("meetups")
      .where("title", "==", data.title)
      .get();

    const relatedMeetups = relatedSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // -----------------------------
    // 5) 장소 data format
    // -----------------------------
    const location = {
      name: data.location?.name ?? "",
      lat: data.location?.lat ?? 0,
      lng: data.location?.lng ?? 0,
      address: data.location?.address ?? data.address ?? "",
    };

    // -----------------------------
    // 6) 자동 리뷰 오픈 처리 (1시간 후)
    // -----------------------------
    try {
      const meetupDate = new Date(data.datetime);
      const oneHourAfter = new Date(meetupDate.getTime() + 60 * 60 * 1000);
      const now = new Date();

      if (!data.reviewsOpen && now > oneHourAfter) {
        console.log(`📢 Auto-opening reviews for meetup: ${meetupId}`);

        // reviewsOpen 업데이트
        await adminDb.collection("meetups").doc(meetupId).update({
          reviewsOpen: true,
          updatedAt: new Date().toISOString(),
        });

        data.reviewsOpen = true;

        // 참가자들에게 알림 생성
        if (participantIds.length > 0) {
          const batch = adminDb.batch();
          participantIds.forEach((uid) => {
            const nref = adminDb.collection("notifications").doc();
            batch.set(nref, {
              userId: uid,
              meetupId,
              type: "review_prompt",
              message: `💬 "${data.title}" meetup has ended! Please leave a review.`,
              read: false,
              createdAt: new Date().toISOString(),
            });
          });
          await batch.commit();

          console.log(
            `📨 Sent review reminder notifications to ${participantIds.length} users`
          );
        }
      }
    } catch (e) {
      console.error("⚠️ Auto review open failed:", e);
    }

    return NextResponse.json(
      {
        id: snap.id,
        ...data,
        participantsCount: participantIds.length,
        participantsDetailed,
        participantsAvatars,
        location,
        event: eventData ?? null,
        upcomingEvents,
        relatedMeetups,
        reviewsOpen: data.reviewsOpen ?? false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching meetup:", error);
    return NextResponse.json(
      { error: "Failed to load meetup" },
      { status: 500 }
    );
  }
}

/* ============================================================
   PATCH /api/meetups/[meetupId]  (밋업 수정)
============================================================ */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<MeetupParams> }
) {
  const { meetupId } = await params;

  try {
    const body = await req.json();

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

    // 업데이트할 항목이 없을 때
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
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
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
      if (location.address)
        updateData["location.address"] = location.address;
    }

    await adminDb.collection("meetups").doc(meetupId).update(updateData);

    return NextResponse.json({
      ok: true,
      message: "Meetup updated successfully",
    });
  } catch (error) {
    console.error("🔥 Error updating meetup:", error);
    return NextResponse.json(
      { error: "Failed to update meetup" },
      { status: 500 }
    );
  }
}

/* ============================================================
   DELETE /api/meetups/[meetupId]
============================================================ */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<MeetupParams> }
) {
  const { meetupId } = await params;

  try {
    await adminDb.collection("meetups").doc(meetupId).delete();

    return NextResponse.json({
      ok: true,
      message: "Meetup deleted successfully",
    });
  } catch (error) {
    console.error("🔥 Error deleting meetup:", error);
    return NextResponse.json(
      { error: "Failed to delete meetup" },
      { status: 500 }
    );
  }
}
