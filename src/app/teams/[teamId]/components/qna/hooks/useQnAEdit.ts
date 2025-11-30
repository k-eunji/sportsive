//(src/app/teams/[teamId]/components/qna/hooks/useQnAEdit.ts)

"use client";

import { useState } from "react";

export default function useQnAEdit(question: any, teamId: string, qaId: string) {
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(question.data.question);

  async function saveEdit() {
    await fetch(`/api/teams/${teamId}/qna/${qaId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText }),
    });

    question.data.question = editText;
    question.editedAt = new Date().toISOString();

    setEditMode(false);
  }

  async function deleteQuestion() {
    await fetch(`/api/teams/${teamId}/qna/${qaId}/delete`, {
      method: "POST",
    });

    window.location.reload();
  }

  return {
    editMode,
    setEditMode,
    editText,
    setEditText,
    saveEdit,
    deleteQuestion,
  };
}
