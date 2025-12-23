// src/app/api/comments/[type]/[parentId]/route.ts

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

interface CommentRouteParams {
  type: string;
  parentId: string;
}

function getBaseRef(type: string, parentId: string) {
  if (type === "fanhub") {
    return adminDb
      .collection("fanhub")
      .doc("global")
      .collection("messages")
      .doc(parentId);
  }
  return adminDb.collection(type).doc(parentId);
}

export async function GET(
  req: Request,
  context: { params: Promise<CommentRouteParams> }
) {
  const { type, parentId } = await context.params;

  try {
    const url = new URL(req.url);
    const currentUserId = url.searchParams.get("userId");

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

        const commentLikesSnap = await doc.ref.collection("likes").get();
        const likeCount = commentLikesSnap.size;

        let isLiked = false;
        if (currentUserId) {
          const likedDoc = await doc.ref
            .collection("likes")
            .doc(currentUserId)
            .get();
          isLiked = likedDoc.exists;
        }

        const repliesSnap = await doc.ref
          .collection("replies")
          .orderBy("createdAt", "asc")
          .get();

        const replies = await Promise.all(
          repliesSnap.docs.map(async (r) => {
            const d = r.data();

            const replyLikesSnap = await r.ref.collection("likes").get();
            const replyLikeCount = replyLikesSnap.size;

            let replyIsLiked = false;
            if (currentUserId) {
              const likedDoc = await r.ref
                .collection("likes")
                .doc(currentUserId)
                .get();
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
              isLiked: Boolean(replyIsLiked),
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
          isLiked: Boolean(isLiked),
        };
      })
    );

    return NextResponse.json(comments);
  } catch (error) {
    console.error("❌ Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<CommentRouteParams> }
) {
  const { type, parentId } = await context.params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, authorNickname, userId, parentCommentId } = body;

  if (!text?.trim() || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const baseRef = getBaseRef(type, parentId);

    if (!parentCommentId) {
      await baseRef.set(
        { commentCount: FieldValue.increment(1) },
        { merge: true }
      );
    }

    const targetRef = parentCommentId
      ? baseRef.collection("comments").doc(parentCommentId).collection("replies")
      : baseRef.collection("comments");

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
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}
