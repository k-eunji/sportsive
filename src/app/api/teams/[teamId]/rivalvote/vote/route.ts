//src/app/api/teams/[teamId]/rivalvote/vote/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: any) {
  try {
    const { teamId } = await ctx.params;
    const { userId, rivalTeamId } = await req.json();

    if (!userId || !rivalTeamId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    const moduleRef = db
      .collection("teams")
      .doc(teamId)
      .collection("rivalvote")
      .doc("module");

    const historyRef = moduleRef
      .collection("voteHistory")
      .doc(`${userId}_${today}`);

    if ((await historyRef.get()).exists) {
      return NextResponse.json({ error: "Already voted today" }, { status: 409 });
    }

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(moduleRef);
      if (!snap.exists) throw new Error("Module not found");

      const raw = snap.data() as any;

      // 🟢 Firestore 구조에 맞게 data.options 읽기
      const options =
        Array.isArray(raw.data?.options) ? [...raw.data.options] : [];

      const idx = options.findIndex(
        (o) => String(o.teamId) === String(rivalTeamId)
      );

      if (idx === -1) throw new Error("Invalid rivalTeamId");

      options[idx].votes++;

      // 🟢 data.options 내부 업데이트
      tx.update(moduleRef, {
        "data.options": options,
        "reactions.participants": (raw.reactions?.participants ?? 0) + 1,
      });

      tx.set(historyRef, {
        userId,
        rivalTeamId,
        date: today,
        timestamp: Date.now(),
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("RivalVote Vote Error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
