// src/components/comments/CommentItem.tsx

"use client";

import { useCommentItem } from "./CommentItem/useCommentItem";
import CommentReplyList from "./CommentReplyList";
import CommentInput from "./CommentInput";
import { MoreVertical } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { timeAgoModern } from "@/utils/date";
import { useRouter } from "next/navigation";
import { Comment } from "@/types";

type Props = {
  comment: Comment;
  user?: { userId?: string; authorNickname?: string };
  enableLikes?: boolean;
  replyTarget?: string | null;
  onStartReply: (parentId: string) => void;
  onReplySubmit: (parentId: string, text: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onDelete?: (id: string) => void;
  onLikeComment?: (commentId: string) => void;
  onLikeReply?: (replyFullId: string) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
};

export type CommentItemProps = Props;

export default function CommentItem({
  comment,
  user,
  enableLikes = true, 
  replyTarget,
  onStartReply,
  onReplySubmit,
  onEdit,
  onDelete,
  onLikeComment,
  onLikeReply,
  openMenuId,        // ⭐ 추가
  setOpenMenuId,     // ⭐ 추가
}: Props) {


  const {
    editing, setEditing,
    editText, setEditText,
  } = useCommentItem(comment);

  // ⭐ 메뉴 열렸는지 여부는 CommentList가 결정
  const menuOpen = openMenuId === comment.id;


  const router = useRouter();
  const isMine = user?.userId === comment.userId;

  return (
    <div className="py-3 border-b border-gray-200 dark:border-gray-800">

      {/* UI 수정 없음 */}
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-start">

          <UserAvatar
            userId={comment.userId}
            name={comment.authorNickname}
            size={32}
            showName={false}
          />

          <div className="flex flex-col">

            <div className="flex items-center gap-2">
              <span
                className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
                onClick={() => router.push(`/profile/${comment.userId}`)}
              >
                {comment.authorNickname}
              </span>

              <span className="text-xs text-gray-500">
                {timeAgoModern(comment.createdAt)}
              </span>

              {/* ⭐ 여기 추가 */}
                {comment.edited && (
                  <span className="text-xs text-gray-400">(edited)</span>
                )}

                  
              {enableLikes && (
                <button
                  data-like
                  onClick={() => onLikeComment?.(comment.id)}
                  className={`text-xs ml-1 ${
                    comment.isLiked ? "text-red-500" : "text-gray-400"
                  } hover:text-red-500`}
                >
                  ❤️ {comment.likeCount ?? 0}
                </button>
              )}
            </div>

            {!editing ? (
              <p className="text-sm text-gray-800 dark:text-gray-300 mt-0.5">
                {comment.text}
              </p>
            ) : (
              <div className="flex gap-2 mt-1">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded-lg 
                             dark:bg-gray-800 dark:text-gray-100"
                />
                <button
                  onClick={() => {
                    onEdit?.(comment.id, editText);
                    setEditing(false);
                  }}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs text-gray-500"
                >
                  Cancel
                </button>
              </div>
            )}

            {!editing && (
              <div className="flex flex-col mt-1">
                {user && (
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => onStartReply(comment.id)}
                  >
                    Reply
                  </button>
                )}

                {(comment.replies ?? []).length > 0 && (
                  <CommentReplyList
                    replies={comment.replies ?? []}
                    user={user}
                    forceOpen={replyTarget === comment.id}
                    onEditReply={(replyId, newText) =>
                      onEdit?.(`${comment.id}/${replyId}`, newText)
                    }
                    onDeleteReply={(replyId) =>
                      onDelete?.(`${comment.id}/${replyId}`)
                    }
                    onLikeReply={onLikeReply}
                  />
                )}
              </div>
            )}

          </div>
        </div>

        {isMine && (
          <div className="relative">
            <button
              onClick={() => setOpenMenuId(menuOpen ? null : comment.id)}

              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-28 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md text-sm">
                <button
                  onClick={() => {
                    setEditing(true);
                    setOpenMenuId(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    if (confirm("Delete comment?")) onDelete?.(comment.id);
                    setOpenMenuId(null);
                  }}

                  className="w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
