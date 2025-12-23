// src/app/api/teams/[teamId]/meetups/route.ts

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

interface TeamParams {
  teamId: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<TeamParams> }
) {
  const { teamId } = await params;
  const teamIdNum = Number(teamId);

  try {
    const meetupsRef = adminDb.collection("meetups");

    // 1) MATCH meetups
    const matchSnap = await meetupsRef
      .where("teamId", "==", teamIdNum)
      .where("type", "==", "match_attendance")
      .get();

    const matchMeetups = matchSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // 2) FAN meetups (type 없이)
    const fanSnap = await meetupsRef
      .where("teamId", "==", teamIdNum)
      .get();

    const allTeamMeetups = fanSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as any[];

    // 3) JS에서 type 필터
    const fanMeetups = allTeamMeetups.filter((m) =>
      ["pub_gathering", "online_game", "pickup_sports"].includes(m.type)
    );

    return NextResponse.json({ matchMeetups, fanMeetups });
  } catch (err) {
    console.error("❌ Team meetups fetch error:", err);
    return NextResponse.json(
      { matchMeetups: [], fanMeetups: [] },
      { status: 500 }
    );
  }
}
