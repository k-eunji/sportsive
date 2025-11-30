//src/components/messages/MessageActions.tsx

"use client";

// @ts-ignore
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
// @ts-ignore
import Ban from "lucide-react/dist/esm/icons/ban";
// @ts-ignore
import Undo2 from "lucide-react/dist/esm/icons/undo-2";

import { useState, useEffect } from "react";

interface MessageActionsProps {
  conversationId: string;
  userId: string;
  token: string;
  onActionDone?: () => void;
}

export default function MessageActions({
  conversationId,
  userId,
  token,
  onActionDone,
}: MessageActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // ✅ 차단 여부 확인
  useEffect(() => {
    if (!token || !userId) return;
    (async () => {
      const res = await fetch(`/api/users/${userId}/block-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsBlocked(data.blocked === true);
      }
    })();
  }, [token, userId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    try {
      setLoading("delete");
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Conversation deleted successfully.");
        onActionDone?.();
      } else {
        alert("Failed to delete conversation.");
      }
    } catch (err) {
      console.error("❌ Delete failed:", err);
    } finally {
      setLoading(null);
    }
  };

  const handleBlockToggle = async () => {
    try {
      setLoading("block");
      const res = await fetch(
        `/api/users/${userId}/${isBlocked ? "unblock" : "block"}`,
        {
          method: isBlocked ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        alert(isBlocked ? "User unblocked." : "User blocked.");
        setIsBlocked(!isBlocked);
        onActionDone?.();
      } else {
        alert("Failed to update block status.");
      }
    } catch (err) {
      console.error("❌ Block toggle failed:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2 transition-opacity">
      {/* 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // ✅ 부모 클릭 방지
          handleDelete();
        }}
        disabled={loading === "delete"}
        className="text-muted-foreground hover:text-red-500 p-1 transition-colors"
        title="Delete conversation"
      >
        <Trash2 size={18} className="text-foreground" />
      </button>

      {/* 차단/해제 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // ✅ 부모 클릭 방지
          handleBlockToggle();
        }}
        disabled={loading === "block"}
        className={`p-1 transition-colors ${
          isBlocked
            ? "text-green-500 hover:text-green-400"
            : "text-muted-foreground hover:text-orange-500"
        }`}
        title={isBlocked ? "Unblock user" : "Block user"}
      >
        {isBlocked ? (
          <Undo2 size={18} className="text-foreground" />
        ) : (
          <Ban size={18} className="text-foreground" />
        )}
      </button>
    </div>
  );
}
