// src/app/api/meetups/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createMeetupServer } from "@/lib/meetups.server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      console.error("🚫 Unauthorized request — no Bearer token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const hostId = decodedToken.uid;

    console.log("👤 Host authenticated:", hostId);

    // ---------- 기본 Meetup 데이터 구성 ----------
    const meetupData: any = {
      ...body,
      hostId,
      status: "pending",
      purpose: body.purpose ?? "",
      details: body.details ?? "",
      authorNickname: body.authorNickname ?? "Unknown",
      teamType: body.teamType ?? "neutral",
      teamId: body.teamId ?? null,
      participants: [],
      maxParticipants: body.maxParticipants ?? 10,
      imageUrl: body.imageUrl || null,
      reviewsOpen: false,
      createdAt: new Date().toISOString(),
    };

    // ---------- 위치 처리 ----------
    if (body.type === "online_game") {
      meetupData.location = { name: "Online", address: "", lat: 0, lng: 0 };
    } else if (body.venue) {
      meetupData.location = {
        name: body.venue.name || "",
        address: body.venue.address || body.venue.name || "",
        lat: body.venue.lat || 0,
        lng: body.venue.lng || 0,
      };
    } else {
      meetupData.location = { name: "", address: "", lat: 0, lng: 0 };
    }

    // ---------- 온라인 게임 옵션 ----------
    if (body.type === "online_game") {
      meetupData.onlineLink = body.onlineLink ?? "";
      meetupData.onlineGameName = body.onlineGameName ?? "";
    }

    // ---------- 이벤트 처리 ----------
    if (body.selectedEvent) {
      meetupData.event = body.selectedEvent;
      meetupData.eventId = body.selectedEvent.id;
    } else if (body.selectedEventId) {
      meetupData.eventId = body.selectedEventId;
    }

    // ---------- 모집 마감일 ----------
    if (body.applicationDeadline && body.applicationDeadline !== "") {
      meetupData.applicationDeadline = new Date(
        body.applicationDeadline
      ).toISOString();
    }

    console.log("🛠️ Creating meetup with data:", JSON.stringify(meetupData, null, 2));

    const meetupId = await createMeetupServer(meetupData);

    console.log("✅ Meetup created successfully:", meetupId);

    return NextResponse.json({ meetupId, status: "pending" });
  } catch (err: any) {
    console.error("🔥 Meetup creation failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create meetup" },
      { status: 500 }
    );
  }
}
