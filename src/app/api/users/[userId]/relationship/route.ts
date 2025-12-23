// src/app/api/users/[userId]/relationship/route.ts

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getRelationshipLabel } from "@/lib/relationships";

interface RouteParams {
  params: { userId: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId: targetUserId } = params;

    const { myId, action } = await req.json();
    if (!myId || !action) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const myRef = adminDb.collection("users").doc(myId);
    const targetRef = adminDb.collection("users").doc(targetUserId);

    const [mySnap, targetSnap] = await Promise.all([
      myRef.get(),
      targetRef.get(),
    ]);

    if (!mySnap.exists || !targetSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const myData = mySnap.data() ?? {};
    const targetData = targetSnap.data() ?? {};

    const mySupports: string[] = myData.supporting ?? [];
    const targetSupports: string[] = targetData.supporting ?? [];

    // -------------------------------------
    // 🔥 SUPPORT / UNSUPPORT 처리
    // -------------------------------------
    if (action === "SUPPORT") {
      if (!mySupports.includes(targetUserId)) {
        mySupports.push(targetUserId);
      }
    } else if (action === "UNSUPPORT") {
      const idx = mySupports.indexOf(targetUserId);
      if (idx >= 0) mySupports.splice(idx, 1);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // -------------------------------------
    // 🔥 관계 계산
    // -------------------------------------
    let newStatus: "NONE" | "I_SUPPORT" | "MUTUAL" | "TEAMMATE" = "NONE";

    const iSupport = mySupports.includes(targetUserId);
    const theySupport = targetSupports.includes(myId);

    if (iSupport && theySupport) {
      newStatus = "MUTUAL";

      // 서로 응원 + 공동 밋업 → TEAMMATE
      const meetupsSnap = await adminDb
        .collection("meetups")
        .where("participants", "array-contains", myId)
        .get();

      let shared = 0;

      for (const d of meetupsSnap.docs) {
        const participants = d.data().participants || [];
        if (participants.includes(targetUserId)) shared++;
      }

      if (shared >= 1) {
        newStatus = "TEAMMATE";
      }
    } else if (iSupport) {
      newStatus = "I_SUPPORT";
    }

    // -------------------------------------
    // 🔥 UPDATE
    // -------------------------------------
    await myRef.update({
      supporting: mySupports,
      updatedAt: new Date().toISOString(),
    });

    const relInfo = getRelationshipLabel(newStatus);

    return NextResponse.json({
      success: true,
      relationship: newStatus,
      label: relInfo.label,
      desc: relInfo.desc,
      color: relInfo.color,
    });
  } catch (err) {
    console.error("❌ Error updating relationship:", err);
    return NextResponse.json(
      { error: "Failed to update relationship" },
      { status: 500 }
    );
  }
}
