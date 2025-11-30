// src/app/fanhub/components/item/MessageText.tsx

"use client";

import HighlightHashtags from "../input/HighlightHashtags";

export default function MessageText({
  text,
  onBodyClick,
}: {
  text?: string;
  onBodyClick?: () => void;
}) {
  if (!text) return null;

  return (
    <p
      className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line mb-3 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation(); // 좋아요/댓글 이벤트와 충돌 방지
        onBodyClick?.();
      }}
    >
      <HighlightHashtags text={text} />
    </p>
  );
}
