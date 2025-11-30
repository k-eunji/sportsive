//(src/app/teams/[teamId]/components/qna/QnACommentInput.tsx)

"use client";

import { useUser } from "@/context/UserContext";

export default function QnACommentInput({ text, setText, send }: any) {
  const { user: currentUser } = useUser();

  if (!currentUser) return null;

  return (
    <div className="flex gap-2 pt-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write an answer..."
        className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
        onKeyDown={(e) => {
          // 엔터 입력시 전송
          if (e.key === "Enter") {
            e.preventDefault();
            send();
          }
        }}
      />

      <button
        onClick={send}
        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
      >
        Send
      </button>
    </div>
  );
}
