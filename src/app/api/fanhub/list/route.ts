// src/app/api/fanhub/list/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

function toMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === "string") return new Date(ts).getTime();
  if (ts._seconds) return ts._seconds * 1000;
  return Date.now();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tag = url.searchParams.get("tag");
  const sort = url.searchParams.get("sort") || "latest";

  let query: FirebaseFirestore.Query = db
    .collection("fanhub")
    .doc("global")
    .collection("messages");

  if (tag) {
    query = query.where("tags", "array-contains", tag);
  }

  const snap = await query.get();

  // messages[]
  let messages: any[] = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: toMillis(data.createdAt),  // ⭐ 안전하게 변환
    };
  });

  // Likes & Comments 가져오기
  for (let m of messages) {
    const likesSnap = await db
      .collection("likes")
      .doc("fanhub")
      .collection(m.id)
      .get();

    const commentsSnap = await db
      .collection("comments")
      .doc("fanhub")
      .collection(m.id)
      .get();

    m.likes = likesSnap.size;
    m.comments = commentsSnap.size;
  }

  // 🔥 HOT 정렬
  if (sort === "hot") {
    messages.sort((a, b) => {
      const scoreA = a.likes * 2 + a.comments;
      const scoreB = b.likes * 2 + b.comments;
      return scoreB - scoreA;
    });
  }

  // 📈 TRENDING 정렬
  if (sort === "trending") {
    messages.sort((a, b) => {
      const ageA = Date.now() - a.createdAt;
      const ageB = Date.now() - b.createdAt;

      const scoreA =
        (a.likes * 2 + a.comments) * (ageA < 86400000 ? 1.5 : 1);
      const scoreB =
        (b.likes * 2 + b.comments) * (ageB < 86400000 ? 1.5 : 1);

      return scoreB - scoreA;
    });
  }

  // 🕒 LATEST 정렬
  if (sort === "latest") {
    messages.sort((a, b) => b.createdAt - a.createdAt);
  }

  return NextResponse.json(messages);
}
