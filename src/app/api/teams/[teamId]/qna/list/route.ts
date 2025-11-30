// src/app/api/teams/[teamId]/qna/list/route.ts

import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: any) {
  const { teamId } = await params;

  const sort = new URL(req.url).searchParams.get("sort") ?? "latest";

  const snap = await db
    .collection("teams")
    .doc(teamId)
    .collection("qna")
    .orderBy("createdAt", "desc")
    .get();

  // ❗ 질문 목록
  let list = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  // ❗ 댓글 수 읽어오는 병렬 처리
  list = await Promise.all(
    list.map(async (qna: any) => {
      const commentsSnap = await db
        .collection("teams")
        .doc(teamId)
        .collection("qna")
        .doc(qna.id)
        .collection("comments")
        .get();

      return {
        ...qna,
        answerCount: commentsSnap.size, // ⭐ 댓글 갯수
      };
    })
  );

  // 정렬 옵션
  if (sort === "answers") {
    list = list.sort((a: any, b: any) => b.answerCount - a.answerCount);
  }

  return NextResponse.json(list);
}
