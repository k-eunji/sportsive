// src/app/api/messages/inbox/route.ts

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function GET(req: NextRequest) {
  try {
    const uid = await getCurrentUserId(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 내가 포함된 DM 목록 조회
    const snap = await adminDb
      .collection("conversations")
      .where("type", "==", "dm")
      .where("participants", "array-contains", uid)
      .get();

    const uniqueMap = new Map<string, any>();

    const inbox = await Promise.all(
      snap.docs.map(async (doc) => {
        const data = doc.data() as any;
        const otherId = data.participants.find((id: string) => id !== uid);
        if (!otherId) return null;

        // 🔹 상대 닉네임 가져오기
        let authorNickname = null;
        try {
          const userDoc = await adminDb.collection("users").doc(otherId).get();
          if (userDoc.exists) {
            const u = userDoc.data() as any;
            authorNickname =
              u.authorNickname ||
              u.nickname ||
              u.name ||
              otherId;
          }
        } catch (e) {
          console.warn(`⚠️ Failed to load nickname for ${otherId}`);
        }

        const convo = {
          id: doc.id,
          otherUserId: otherId,
          authorNickname,
          participantsKey: data.participantsKey || "",
          lastMessage: data.lastMessage || "",
          lastSender: data.lastSender || "",
          unreadCount: 0,
          lastMessageIsRead: false,
          updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
        };

        // 🔹 안 읽은 메시지 수
        const unreadSnap = await adminDb
          .collection("conversations")
          .doc(doc.id)
          .collection("messages")
          .where("to", "==", uid)
          .where("isRead", "==", false)
          .get();

        convo.unreadCount = unreadSnap.size;

        // 🔹 최신 메시지 가져오기
        const lastMsgSnap = await adminDb
          .collection("conversations")
          .doc(doc.id)
          .collection("messages")
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();

        if (!lastMsgSnap.empty) {
          const lastMsg = lastMsgSnap.docs[0].data() as any;
          convo.lastMessage = lastMsg.text;
          convo.lastSender = lastMsg.from;
          convo.updatedAt = lastMsg.createdAt;
          convo.lastMessageIsRead =
            lastMsg.from === uid ? !!lastMsg.isRead : false;
        }

        // 🔹 상대방마다 최신 대화만 유지
        const existing = uniqueMap.get(otherId);
        if (!existing || new Date(convo.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
          uniqueMap.set(otherId, convo);
        }

        return convo;
      })
    );

    // 🔹 최신순 정렬
    const filtered = Array.from(uniqueMap.values())
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json(filtered);
  } catch (err) {
    console.error("❌ GET /api/messages/inbox:", err);
    return NextResponse.json(
      { error: "Failed to fetch inbox" },
      { status: 500 }
    );
  }
}
