// src/components/comments/CommentReplyList.tsx

"use client";

import { useReplyList } from "./CommentReplyList/useReplyList";
import { timeAgoModern } from "@/utils/date";
import { MoreVertical } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { useRouter } from "next/navigation";
import { Reply } from "@/types";
import CommentInput from "./CommentInput";

type Props = {
  replies: Reply[];
  user?: { userId?: string };
  enableLikes?: boolean;
  forceOpen?: boolean;
  onEditReply?: (replyId: string, newText: string) => void;
  onDeleteReply?: (replyId: string) => void;
  onLikeReply?: (replyFullId: string) => void;
};

export default function CommentReplyList({
  replies,
  user,
  enableLikes = true, 
  forceOpen,
  onEditReply,
  onDeleteReply,
  onLikeReply,
}: Props) {

  const {
    isOpen,
    setIsOpen,
    editingId,
    setEditingId,
    editText,
    setEditText,
    menuOpenId,
    setMenuOpenId,
  } = useReplyList(replies, forceOpen);

  const router = useRouter();

  if (!replies.length) return null;

  return (
    <div className="mt-2 ml-12">

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-xs text-gray-500 hover:text-gray-600 mb-2"
      >
        {isOpen ? "Close replies" : `Open replies (${replies.length})`}
      </button>

      {isOpen && (
        <div className="space-y-4">
          {replies.map((r) => {
            const isMine = user?.userId === r.userId;
            const isEditing = editingId === r.id;
            const menuOpen = menuOpenId === r.id;

            return (
              <div key={r.id} className="relative">

                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-700 ml-2" />

                <div className="ml-6">
                  <div className="flex items-start gap-3">

                    <UserAvatar
                      userId={r.userId}
                      name={r.authorNickname}
                      size={30}
                      showName={false}
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">

                          <span
                            className="text-sm font-semibold cursor-pointer text-gray-900 dark:text-gray-100"
                            onClick={() => router.push(`/profile/${r.userId}`)}
                          >
                            {r.authorNickname}
                          </span>

                          <span className="text-xs text-gray-500">
                            {timeAgoModern(r.createdAt)}
                          </span>
                          
                          {r.edited && (
                            <span className="text-xs text-gray-400">(edited)</span>
                          )}


                          {enableLikes && (
                            <button
                              data-like
                              onClick={() => onLikeReply?.(`${r.parentCommentId}/${r.id}`)}
                              className={`text-xs ${
                                r.isLiked ? "text-red-500" : "text-gray-400"
                              } hover:text-red-500`}
                            >
                              ❤️ {r.likeCount ?? 0}
                            </button>
                          )}

                        </div>

                        {isMine && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setMenuOpenId(menuOpen ? null : r.id)
                              }
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <MoreVertical size={14} />
                            </button>

                            {menuOpen && (
                              <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 
                                              border border-gray-200 dark:border-gray-700
                                              rounded-md shadow-md w-28 text-sm z-20">

                                <button
                                  onClick={() => {
                                    setEditText(r.text);
                                    setEditingId(r.id);
                                    setMenuOpenId(null);
                                  }}
                                  className="block w-full text-left px-3 py-2 
                                            hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => {
                                    if (confirm("Delete this reply?")) {
                                      onDeleteReply?.(r.id);
                                    }
                                    setMenuOpenId(null);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-red-500 
                                            hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Delete
                                </button>

                              </div>
                            )}
                          </div>
                        )}

                      </div>

                      {!isEditing ? (
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {r.text}
                        </p>
                      ) : (
                        <div className="flex gap-2 mt-2">
                          <input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-2 py-1 border rounded-lg 
                                      dark:bg-gray-800 dark:text-gray-100"
                          />

                          <button
                            onClick={() => {
                              onEditReply?.(r.id, editText);
                              setEditingId(null);
                            }}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
