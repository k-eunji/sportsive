// src/components/ui/ReplyToggleBar.tsx
"use client";

import { motion } from "framer-motion";

interface Props {
  count: number;
  open: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}

export default function ReplyToggleBar({ count, open, onToggle, size = "md" }: Props) {
  return (
    <div className="flex items-center gap-6 mt-3 select-none">
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-2 
          text-gray-500 
          ${size === "sm" ? "text-sm" : "text-base"}
          hover:text-blue-600 
          active:scale-95 transition
        `}
      >
        <motion.span
          animate={{ rotate: open ? 0 : 0 }}  // 여기서 rotate나 bounce 넣어도 됨
        >
          💬
        </motion.span>
        <span className="font-semibold">{count}</span>
      </button>
    </div>
  );
}
