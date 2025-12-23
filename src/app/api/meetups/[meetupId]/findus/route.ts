// src/app/api/meetups/[meetupId]/findus/route.ts

export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

interface MeetupParams {
  meetupId: string;
}

export async function PATCH(
  req: Request,
  { params }: { params: MeetupParams }
) {
  const { meetupId } = params;

  try {
    const body = await req.json();
    const { findUsNote } = body;

    if (typeof findUsNote !== "string" || !findUsNote.trim()) {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    await adminDb
      .collection("meetups")
      .doc(meetupId)
      .update({
        findUsNote: findUsNote.trim(),
        updatedAt: new Date().toISOString(),
      });

    console.log(`✅ findUsNote updated for meetup ${meetupId}:`, findUsNote);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Failed to update findUsNote:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update findUsNote",
      },
      { status: 500 }
    );
  }
}
