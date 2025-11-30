// src/app/live/[sport]/[liveId]/components/FloatingEmojiLayer.tsx

"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import "@/app/live/[sport]/[liveId]/styles/emoji.css";

interface FloatingItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

const FloatingEmojiLayer = forwardRef((props, ref) => {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useImperativeHandle(ref, () => ({
    spawn(emoji: string, x: number, y: number) {
      const id = Date.now();

      setItems((prev) => [...prev, { id, emoji, x, y }]);

      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }, 1500);
    },
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      {items.map((i) => (
        <span
          key={i.id}
          className="floating-emoji"
          style={{ left: i.x, top: i.y }}
        >
          {i.emoji}
        </span>
      ))}
    </div>
  );
});

export default FloatingEmojiLayer;
