// src/app/api/messages/inbox/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function GET(req: Request) {
  try {
    const uid = await getCurrentUserId(req);
    if (!uid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ✅ 내가 포함된 DM만 조회
    const snap = await db
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

        // ✅ 닉네임 가져오기
        let authorNickname = null;
        try {
          const userDoc = await db.collection("users").doc(otherId).get();
          if (userDoc.exists) {
            const userData = userDoc.data() as any;
            authorNickname =
              userData.authorNickname ||
              userData.nickname ||
              userData.name ||
              otherId;
          }
        } catch (e) {
          console.warn(`⚠️ Failed to load nickname for ${otherId}`);
        }

        const convo = {
          id: doc.id,
          otherUserId: otherId,
          authorNickname,
          lastMessage: data.lastMessage || "",
          lastSender: data.lastSender || "",
          updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
          participantsKey: data.participantsKey || "",
          unreadCount: 0,
          lastMessageIsRead: false,
        };

        // ✅ 안 읽은 메시지 개수 계산
        const msgsSnap = await db
          .collection("conversations")
          .doc(doc.id)
          .collection("messages")
          .where("to", "==", uid)
          .where("isRead", "==", false)
          .get();
        convo.unreadCount = msgsSnap.size;

        // ✅ 마지막 메시지 읽음 여부 (내가 보낸 경우만)
        // ✅ inbox API의 각 convo 생성 부분 안에서
        const lastMsgSnap = await db
          .collection("conversations")
          .doc(doc.id)
          .collection("messages")
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();

        if (!lastMsgSnap.empty) {
          const lastMsg = lastMsgSnap.docs[0].data();
          convo.lastMessage = lastMsg.text;
          convo.lastSender = lastMsg.from;
          convo.updatedAt = lastMsg.createdAt;
          convo.lastMessageIsRead =
            lastMsg.from === uid ? !!lastMsg.isRead : false;
        }

        // ✅ 같은 상대의 최신 대화만 유지
        if (!uniqueMap.has(otherId)) {
          uniqueMap.set(otherId, convo);
        } else {
          const existing = uniqueMap.get(otherId);
          if (
            new Date(convo.updatedAt).getTime() >
            new Date(existing.updatedAt).getTime()
          ) {
            uniqueMap.set(otherId, convo);
          }
        }

        return convo;
      })
    );

    // ✅ 최신순 정렬로 반환
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
