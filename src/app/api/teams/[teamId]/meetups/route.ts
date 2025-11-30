// src/app/api/teams/[teamId]/meetups/route.ts

import { NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

interface TeamParams {
  teamId: string;
}

export async function GET(_req: Request, { params }: { params: Promise<TeamParams> }) {
  const { teamId } = await params;

  const teamIdNum = Number(teamId);

  try {
    const meetupsRef = collection(db, "meetups");

    // ⭐ 1) MATCH meetups (정상)
    const qMatch = query(
      meetupsRef,
      where("teamId", "==", teamIdNum),
      where("type", "==", "match_attendance")
    );
    const matchSnap = await getDocs(qMatch);
    const matchMeetups = matchSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // ⭐ 2) FAN meetups — 여기서 type 필터 제거!!!
    const qFan = query(meetupsRef, where("teamId", "==", teamIdNum));
    const fanSnap = await getDocs(qFan);

    const allTeamMeetups = fanSnap.docs.map((d) =>
      ({ id: d.id, ...d.data() } as any)
    );


    // ⭐ 3) JS에서 필터링(안전함)
    const fanMeetups = allTeamMeetups.filter((m) =>
      ["pub_gathering", "online_game", "pickup_sports"].includes(m.type)
    );

    return NextResponse.json({ matchMeetups, fanMeetups });
  } catch (err) {
    console.error("❌ Team meetups fetch error:", err);
    return NextResponse.json({ matchMeetups: [], fanMeetups: [] }, { status: 500 });
  }
}
