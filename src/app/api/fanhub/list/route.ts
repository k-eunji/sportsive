// src/app/api/fanhub/list/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

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
  let messages: any[] = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

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
      const ageA = Date.now() - new Date(a.createdAt).getTime();
      const ageB = Date.now() - new Date(b.createdAt).getTime();

      const scoreA =
        (a.likes * 2 + a.comments) * (ageA < 86400000 ? 1.5 : 1);
      const scoreB =
        (b.likes * 2 + b.comments) * (ageB < 86400000 ? 1.5 : 1);

      return scoreB - scoreA;
    });
  }

  // 🕒 LATEST 정렬
  if (sort === "latest") {
    messages.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }

  return NextResponse.json(messages);
}
