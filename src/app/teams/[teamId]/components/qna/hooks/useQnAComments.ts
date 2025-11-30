// (src/app/teams/[teamId]/components/qna/hooks/useQnAComments.ts)

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";

export default function useQnAComments(teamId: any, qaId: any, question: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  const { user } = useUser();

  // 댓글 로드
  async function loadComments() {
    const res = await fetch(`/api/comments/teams/${teamId}/qna/${qaId}`);
    const list = await res.json();

    const enriched = await Promise.all(
      list.map(async (c: any) => {
        const likeRes = await fetch(
          `/api/likes/count?type=qnaComment&id=${c.id}`
        );
        const { count } = await likeRes.json();
        return { ...c, likeCount: count };
      })
    );

    setComments(enriched);
  }

  // ⭐ 최초 렌더 때 한번 자동 로드
  useEffect(() => {
    loadComments();
  }, []);

  // 좋아요 토글
  async function toggleLike(id: string) {
    if (!user) return;

    await fetch(`/api/likes/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentType: "qnaComment",
        parentId: id,
        userId: user.uid,
      }),
    });

    loadComments();
  }

  // 댓글 작성
  async function sendComment() {
    if (!text.trim() || !user) return;

    await fetch(`/api/comments/teams/${teamId}/qna/${qaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        userId: user.uid,
        authorNickname: user.authorNickname,
      }),
    });

    question.answerCount += 1;
    setText("");
    loadComments();
  }

  // 댓글 삭제
  async function deleteComment(id: string) {
    await fetch(
      `/api/comments/teams/${teamId}/qna/${qaId}/${id}/delete`,
      { method: "POST" }
    );

    loadComments();
  }

  return {
    comments,
    loadComments,
    toggleLike,
    sendComment,
    deleteComment,
    text,
    setText,
  };
}
