//(src/app/teams/[teamId]/components/qna/QnAQuestionImage.tsx)

"use client";

import { useState } from "react";

export default function QnAQuestionImage({ imageUrl }: any) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!imageUrl) return null;

  return (
    <div className="mt-3 rounded-2xl overflow-hidden bg-black/5">
      {!loaded && !error && (
        <div className="w-full h-60 bg-gray-300 animate-pulse" />
      )}

      {!error && (
        <img
          src={imageUrl}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full rounded-lg border object-contain max-h-72 transition-opacity ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {error && (
        <div className="w-full h-60 bg-gray-400 flex justify-center items-center text-sm text-gray-700">
          Image failed to load
        </div>
      )}
    </div>
  );
}
