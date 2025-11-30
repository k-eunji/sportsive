// src/app/teams/[teamId]/components/FanTalkInput.tsx

"use client";

import { useState } from "react";

export default function FanTalkInput({ text, setText, send }: any) {
  const [imageFile, setImageFile] = useState<File | null>(null);

  function handleKey(e: any) {
    if (e.key === "Enter") {
      e.preventDefault();
      send(imageFile);
      setImageFile(null);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Say something..."
        className="w-full border rounded-lg p-3 text-sm"
        rows={2}
      />

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={() => {
            send(imageFile);
            setImageFile(null);
          }}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
