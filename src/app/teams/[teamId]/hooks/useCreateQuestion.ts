//src/app/teams/[teamId]/hooks/useCreateQuestion.ts

"use client";

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
      const fd = new FormData();
      fd.append("file", imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
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
