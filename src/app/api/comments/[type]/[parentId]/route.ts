// src/app/api/comments/[type]/[parentId]/route.ts

import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

interface CommentRouteParams {
  type: string;
  parentId: string;
}

// 함수: fanhub일 때만 다른 경로 사용하도록
function getBaseRef(type: string, parentId: string) {
  if (type === "fanhub") {
    return adminDB
      .collection("fanhub")
      .doc("global")
      .collection("messages")
      .doc(parentId);
  }
  return adminDB.collection(type).doc(parentId);
}

export async function GET(_req: Request, { params }: { params: Promise<CommentRouteParams> }) {
  const { type, parentId } = await params;

  try {
    const url = new URL(_req.url);
    const currentUserId = url.searchParams.get("userId"); // ⭐ 추가

    const baseRef = getBaseRef(type, parentId);

    const commentsSnap = await baseRef
      .collection("comments")
      .orderBy("createdAt", "desc")
      .get();

    const comments = await Promise.all(
      commentsSnap.docs.map(async (doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?._seconds
          ? data.createdAt._seconds * 1000
          : Date.now();

        // ⭐ 댓글 좋아요 개수
        const commentLikesSnap = await doc.ref.collection("likes").get();
        const likeCount = commentLikesSnap.size;

        // ⭐ 내가 댓글 좋아요 눌렀는지
        let isLiked = false;
        if (currentUserId) {
          const likedDoc = await doc.ref.collection("likes").doc(currentUserId).get();
          isLiked = likedDoc.exists;
        }

        // ⭐ 대댓글
        const repliesSnap = await doc.ref
          .collection("replies")
          .orderBy("createdAt", "asc")
          .get();

        const replies = await Promise.all(
          repliesSnap.docs.map(async (r) => {
            const d = r.data();

            const replyLikesSnap = await r.ref.collection("likes").get();
            const replyLikeCount = replyLikesSnap.size;

            // ⭐ 대댓글 isLiked
            let replyIsLiked = false;
            if (currentUserId) {
              const likedDoc = await r.ref.collection("likes").doc(currentUserId).get();
              replyIsLiked = likedDoc.exists;
            }

            const rCreatedAt = d.createdAt?._seconds
              ? d.createdAt._seconds * 1000
              : Date.now();

            return {
              id: r.id,
              parentCommentId: doc.id,
              ...d,
              edited: Boolean(d.edited),
              createdAt: rCreatedAt,
              likeCount: replyLikeCount,
              isLiked: Boolean(replyIsLiked),  // ← 마지막에!
            };

          })
        );

        return {
          id: doc.id,
          ...data,
          edited: Boolean(data.edited),
          createdAt,
          likeCount,
          replies,
          isLiked: Boolean(isLiked),  // ⭐ 여기에 둬야 함!
        };

      })
    );

    return NextResponse.json(comments);
  } catch (error) {
    console.error("❌ Failed to fetch comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<CommentRouteParams> }) {
  const { type, parentId } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, authorNickname, userId, parentCommentId } = body;

  // 첫 번째 baseRef
  const baseRef = getBaseRef(type, parentId);

  if (!parentCommentId) {
    await baseRef.set(
      { commentCount: FieldValue.increment(1) },
      { merge: true }
    );
  }

  if (!text?.trim() || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    // 두 번째 baseRef
    const baseRef2 = getBaseRef(type, parentId);

    const targetRef = parentCommentId
      ? baseRef2.collection("comments").doc(parentCommentId).collection("replies")
      : baseRef2.collection("comments");

    const newComment = {
      text: text.trim(),
      authorNickname: authorNickname || "Anonymous",
      userId,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await targetRef.add(newComment);

    return NextResponse.json({
      id: docRef.id,
      ...newComment,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error("❌ Failed to post comment/reply:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
