// src/app/meetups/[meetupId]/components/MeetupComments.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import CommentInput from "@/components/comments/CommentInput";
import CommentList from "@/components/comments/CommentList";
import type { Comment, Reply } from "@/types/comment";
import CommentItem from "@/components/comments/CommentItem";

export default function MeetupComments({ meetupId }: { meetupId: string }) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);

  /** ✅ 댓글 목록 불러오기 */
  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments/meetups/${meetupId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(
        data.map((c: any) => ({
          ...c,
          replies: Array.isArray(c.replies) ? c.replies : [],
        }))
      );

    } catch (err) {
      console.error("❌ Error loading comments:", err);
    }
  }, [meetupId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  /** ✅ 댓글 작성 */
  const handleCommentSubmit = async (text: string) => {
    await postComment(text);
  };

  /** ✅ 리플라이 작성 */
  const handleReplySubmit = async (parentId: string, text: string) => {
    await postComment(text, parentId);
  };

  /** ✅ 댓글 or 리플라이 공통 POST */
  const postComment = async (text: string, parentCommentId?: string) => {
    try {
      const res = await fetch(`/api/comments/meetups/${meetupId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          authorNickname: user?.authorNickname,
          userId: user?.userId,
          parentCommentId,
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const data = await res.json();

      setComments((prev) =>
        parentCommentId
          ? prev.map((c) =>
              c.id === parentCommentId
                ? { ...c, replies: [data, ...(c.replies || [])] }
                : c
            )
          : [data, ...prev]
      );
    } catch (err) {
      console.error("❌ Error posting comment:", err);
    }
  };

  /** ✅ 댓글/리플라이 수정 */
  const handleEdit = async (id: string, newText: string) => {
    try {
      const res = await fetch(`/api/comments/meetups/${meetupId}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText }),
      });
      if (!res.ok) throw new Error("Failed to edit comment");

      setComments((prev) => {
        if (id.includes("/")) {
          // 리플라이 수정
          const [commentId, replyId] = id.split("/");
          return prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: (c.replies ?? []).map((r) =>
                    r.id === replyId ? { ...r, text: newText } : r
                  ),
                }
              : c
          );
        }
        // 댓글 수정
        return prev.map((c) => (c.id === id ? { ...c, text: newText } : c));
      });
    } catch (err) {
      console.error("❌ Error editing comment:", err);
    }
  };

  /** ✅ 댓글/리플라이 삭제 */
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/comments/meetups/${meetupId}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");

      setComments((prev) => {
        if (id.includes("/")) {
          const [commentId, replyId] = id.split("/");
          return prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: (c.replies ?? []).filter((r) => r.id !== replyId),
                }
              : c
          );
        }
        return prev.filter((c) => c.id !== id);
      });
    } catch (err) {
      console.error("❌ Error deleting comment:", err);
    }
  };

  return (
    <div className="space-y-4">

      {/* 댓글 입력창 */}
      {user && (
        <CommentInput
          placeholder="Write a comment..."
          onSubmit={handleCommentSubmit}
        />
      )}

      {/* 🔥 기존 CommentList를 없애고 직접 댓글 렌더링 */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="mt-4">

            {/* 기존 CommentItem 컴포넌트 활용 */}
            <CommentItem
              comment={comment}
              user={{
                userId: user?.userId,
                authorNickname: user?.authorNickname,
              }}
              enableLikes={false}
              replyTarget={replyTarget}
              onStartReply={setReplyTarget}
              onReplySubmit={(parentId, text) =>
                postComment(text, parentId)
              }
              onEdit={handleEdit}
              onDelete={handleDelete}
              onLikeComment={() => {}}
              onLikeReply={() => {}}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
            />

            {/* ⭐ Reply 입력창을 MeetupComments에서 제어 */}
            {replyTarget === comment.id && (
              <CommentInput
                autoFocus
                placeholder="Write a reply..."
                onSubmit={(text) => {
                  handleReplySubmit(comment.id, text);
                  setReplyTarget(null);
                }}
              />
            )}

        </div>
      ))}
    </div>

  </div>
);

}
