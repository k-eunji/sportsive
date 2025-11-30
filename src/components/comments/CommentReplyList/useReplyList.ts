// src/components/comments/CommentReplyList/useReplyList.ts
import { useState, useEffect } from "react";
import { Reply } from "@/types";

export function useReplyList(replies: Reply[], forceOpen?: boolean) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  return {
    isOpen,
    setIsOpen,
    editingId,
    setEditingId,
    editText,
    setEditText,
    menuOpenId,
    setMenuOpenId,
  };
}
