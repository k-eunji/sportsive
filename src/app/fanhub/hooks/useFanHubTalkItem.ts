// src/app/fanhub/hooks/useFanHubTalkItem.ts

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Comment } from "@/types";

export function useFanHubTalkItem(message: any) {
  const { user } = useUser();

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentCount, setCommentCount] = useState<number>(message.commentCount ?? 0);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);

  const handleStartReply = (commentId: string) => {
    setReplyTarget(commentId);
  };

  /** 좋아요 수 */
  const fetchLikeCount = async () => {
    const res = await fetch(`/api/likes/count?type=fanhub&id=${message.id}`);
    const data = await res.json();
    setLikeCount(data.count);
  };

  /** 좋아요 여부 */
  const checkIsLiked = async () => {
    if (!user) return;
    const res = await fetch(
      `/api/likes/check?type=fanhub&id=${message.id}&userId=${user.userId}`
    );
    const liked = (await res.json()).liked;
    setIsLiked(liked);
  };

  /** 댓글 목록 */
  const loadComments = async () => {
    if (!user) return;
    const data = await fetch(
      `/api/comments/fanhub/${message.id}?userId=${user?.userId ?? ""}`
    ).then((r) => r.json());
    setComments(data);
  };

  /** 댓글 수정 */
  const handleEdit = async (id: string, newText: string) => {
    if (id.includes("/")) {
      const [commentId, replyId] = id.split("/");
      await fetch(`/api/comments/fanhub/${message.id}/${commentId}/${replyId}`, {
        method: "PATCH",
        body: JSON.stringify({ text: newText }),
      });
    } else {
      await fetch(`/api/comments/fanhub/${message.id}/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ text: newText, edited: true }),
      });

    }
    loadComments();
  };

  /** 댓글 삭제 */
  const handleDelete = async (id: string) => {
    if (id.includes("/")) {
      const [commentId, replyId] = id.split("/");
      await fetch(`/api/comments/fanhub/${message.id}/${commentId}/${replyId}`, {
        method: "DELETE",
      });
    } else {
      await fetch(`/api/comments/fanhub/${message.id}/${id}`, {
        method: "DELETE",
      });
    }
    loadComments();
  };

  /** 댓글 작성 */
  const handleCommentSubmit = async (text: string) => {
    if (!user) return;

    await fetch(`/api/comments/fanhub/${message.id}`, {
      method: "POST",
      body: JSON.stringify({
        text,
        userId: user.userId,
        authorNickname: user.authorNickname,
      }),
    });

    setCommentCount((prev) => prev + 1);
    loadComments();
  };

  /** 대댓글 작성 */
  const handleReplySubmit = async (parentId: string, text: string) => {
    if (!user) return;

    await fetch(`/api/comments/fanhub/${message.id}`, {
      method: "POST",
      body: JSON.stringify({
        parentCommentId: parentId,
        text,
        userId: user.userId,
        authorNickname: user.authorNickname,
      }),
    });

    loadComments();
  };

  /** 댓글 좋아요 */
  const toggleCommentLike = async (commentId: string) => {
    if (!user) return;

    await fetch(`/api/comments/like/toggle`, {
      method: "POST",
      body: JSON.stringify({
        type: "fanhub",
        parentId: message.id,
        commentId,
        replyId: null,
        userId: user.userId,
      }),
    });

    loadComments();
  };

  /** 대댓글 좋아요 */
  const toggleReplyLike = async (fullId: string) => {
    if (!user) return;

    const [commentId, replyId] = fullId.split("/");

    await fetch(`/api/comments/like/toggle`, {
      method: "POST",
      body: JSON.stringify({
        type: "fanhub",
        parentId: message.id,
        commentId,
        replyId,
        userId: user.userId,
      }),
    });

    loadComments();
  };

  /** 본문 좋아요 */
  const toggleLike = async () => {
    if (!user) return;

    const res = await fetch(`/api/likes/toggle`, {
      method: "POST",
      body: JSON.stringify({
        parentType: "fanhub",
        parentId: message.id,
        userId: user.userId,
      }),
    });

    const data = await res.json();
    setIsLiked(data.liked);
    setLikeCount((n) => n + (data.liked ? 1 : -1));
  };

  useEffect(() => {
    fetchLikeCount();
    checkIsLiked();
  }, [user]);

  useEffect(() => {
    if (showComments && user) loadComments();
  }, [showComments, user]);

  return {
    user,
    showComments,
    setShowComments,
    comments,
    likeCount,
    isLiked,
    toggleLike,
    commentCount,
    replyTarget,
    handleStartReply,

    // 댓글/대댓글
    handleCommentSubmit,
    handleReplySubmit,
    handleEdit,
    handleDelete,

    // 좋아요
    toggleCommentLike,
    toggleReplyLike,
  };
}
