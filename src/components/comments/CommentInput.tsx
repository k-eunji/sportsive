//src/components/comments/CommentInput.tsx

"use client";

import { useState } from "react";

type CommentInputProps = {
  onSubmit: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function CommentInput({ onSubmit, placeholder, autoFocus }: CommentInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="flex gap-2 mt-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        autoFocus={autoFocus}
        placeholder={placeholder || "Write a comment..."}
        className="flex-1 border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Post
      </button>
    </div>
  );
}
