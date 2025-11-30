// src/app/teams/[teamId]/components/TeamQnA.tsx

"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import AskQuestionModal from "./AskQuestionModal";
import QnAThread from "./qna/QnAThread";

import { useQnAList } from "../hooks/useQnAList";
import { useCreateQuestion } from "../hooks/useCreateQuestion";

export default function TeamQnA({ teamId }: { teamId: string }) {
  const { user } = useUser();

  const [sort, setSort] = useState("latest");
  const [askOpen, setAskOpen] = useState(false);

  const { questions, loading, load } = useQnAList(teamId, sort);
  const { createQuestion } = useCreateQuestion();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">

      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Q&A</h2>

        <div className="flex gap-3 items-center">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            <option value="latest">Latest</option>
            <option value="answers">Most Answers</option>
          </select>

          <button
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
            onClick={() => setAskOpen(true)}
          >
            Ask Question
          </button>
        </div>
      </div>

      {/* 질문 스레드 */}
      <div className="divide-y">
        {questions.map((q) => (
          <QnAThread key={q.id} question={q} teamId={teamId} />
        ))}
      </div>

      {/* 질문 모달 */}
      <AskQuestionModal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        onSubmit={async (text: string, imageFile: File | null) => {
          await createQuestion({
            teamId,
            text,
            user,
            imageFile,
          });

          setAskOpen(false);
          load();
        }}
      />
    </div>
  );
}
