// src/app/community/components/FeedComposer.tsx

// src/app/community/components/FeedComposer.tsx
"use client";

import { useState } from "react";

export default function FeedComposer({ mode = "all" }: { mode?: string }) {
  const [text, setText] = useState("");

  const placeholders: Record<string, string> = {
    all: "Share anything about your team or game...",
    post: "What’s on your mind? #matchday",
    meetup: "Plan a watch party: Where & When?",
    live: "Set up a live chat for the next match…",
    relationship: "Recommend a fan or teammate to follow…",
  };

  const cta: Record<string, string> = {
    all: "Post",
    post: "Post",
    meetup: "Create Meetup",
    live: "Create Live Room",
    relationship: "Share Recommendation",
  };

  // 🔥 커뮤니티 기능 비활성화용 더미 핸들러
  const handlePost = () => {
    // 아무 것도 하지 않음
    return;
  };

  return (
    <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholders[mode]}
        rows={3}
        className="w-full border rounded-lg p-2 mb-3 text-sm bg-gray-50 dark:bg-gray-800"
      />
      <div className="flex items-center justify-between">
        <button
          onClick={handlePost}
          className={`px-4 py-2 rounded-lg text-white text-sm ${
            mode === "meetup"
              ? "bg-blue-600 hover:bg-blue-700"
              : mode === "live"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {cta[mode]}
        </button>
        <p className="text-xs text-gray-400">
          Earn fan points by posting 🏆
        </p>
      </div>
    </div>
  );
}
