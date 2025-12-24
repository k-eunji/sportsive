//src/app/teams/[teamId]/hooks/useCreateQuestion.ts

"use client";

import { uploadToStorage } from "@/lib/uploadToStorage";

export function useCreateQuestion() {

  async function createQuestion({
    teamId,
    text,
    user,
    imageFile,
  }: {
    teamId: string;
    text: string;
    user: any;
    imageFile: File | null;
  }) {

    if (!user) throw new Error("Login required");

    let imageUrl = null;

    // 🔥 이미지 업로드
    if (imageFile) {
    imageUrl = await uploadToStorage(imageFile);
  }


    // 🔥 질문 생성
    await fetch(`/api/teams/${teamId}/qna/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: text,
        userId: user.uid,
        authorNickname: user.authorNickname,
        imageUrl,
      }),
    });
  }

  return { createQuestion };
}
