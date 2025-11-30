// ✅ src/app/api/users/[userId]/relationship/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getRelationshipLabel } from "@/lib/relationships";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId: targetUserId } = params;

  try {
    const { myId, action } = await req.json();
    if (!myId || !action)
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const myRef = db.collection("users").doc(myId);
    const targetRef = db.collection("users").doc(targetUserId);
    const [mySnap, targetSnap] = await Promise.all([myRef.get(), targetRef.get()]);

    if (!mySnap.exists || !targetSnap.exists)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const myData = mySnap.data() || {};
    const targetData = targetSnap.data() || {};

    const mySupports: string[] = myData.supporting || [];
    const targetSupports: string[] = targetData.supporting || [];

    let newStatus: "NONE" | "I_SUPPORT" | "MUTUAL" | "TEAMMATE" = "NONE";

    // Support or Unsupport
    if (action === "SUPPORT") {
      if (!mySupports.includes(targetUserId)) mySupports.push(targetUserId);
    } else if (action === "UNSUPPORT") {
      const idx = mySupports.indexOf(targetUserId);
      if (idx > -1) mySupports.splice(idx, 1);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Relationship status
    const iSupport = mySupports.includes(targetUserId);
    const theySupport = targetSupports.includes(myId);

    if (iSupport && theySupport) {
      newStatus = "MUTUAL";

      // check shared meetups for teammate status
      const meetupsRef = db.collection("meetups");
      const myMeetupsSnap = await meetupsRef
        .where("participants", "array-contains", myId)
        .get();

      let sharedCount = 0;
      for (const doc of myMeetupsSnap.docs) {
        const data = doc.data();
        if (data.participants?.includes(targetUserId)) sharedCount++;
      }

      if (sharedCount >= 1) newStatus = "TEAMMATE";
    } else if (iSupport) {
      newStatus = "I_SUPPORT";
    }

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
