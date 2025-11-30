// src/components/comments/CommentList.tsx

"use client";

import CommentItem from "./CommentItem";
import { Comment } from "@/types";
import { useState } from "react";

interface CommentListProps {
  comments: Comment[];
  user?: any;
  replyTarget?: string | null;
  onStartReply: (parentId: string) => void;
  onCommentSubmit: (text: string) => void;
  onReplySubmit: (parentId: string, text: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onDelete?: (id: string) => void;

  /* ⭐ 여기에 추가해야 한다 */
  onLikeComment?: (commentId: string) => void;
  onLikeReply?: (replyFullId: string) => void;
}

export default function CommentList({
  comments,
  user,
  replyTarget,
  onStartReply,
  onReplySubmit,
  onEdit,
  onDelete,

  /* ⭐ 여기도 추가 */
  onLikeComment,
  onLikeReply,
}: CommentListProps) {

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <section className="px-1">
      <div className="space-y-5 pb-24">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            user={user}
            replyTarget={replyTarget}
            onStartReply={onStartReply}
            onReplySubmit={onReplySubmit}
            onEdit={onEdit}
            onDelete={onDelete}

            /* ⭐ 추가된 부분 */
            onLikeComment={onLikeComment}
            onLikeReply={onLikeReply}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />

        ))}
      </div>
    </section>
  );
}
