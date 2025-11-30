// src/components/comments/CommentItem/useCommentItem.ts
import { useState } from "react";
import { Comment } from "@/types";

export function useCommentItem(comment: Comment) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [menuOpen, setMenuOpen] = useState(false);

  return {
    editing,
    setEditing,
    editText,
    setEditText,
    menuOpen,
    setMenuOpen,
  };
}
