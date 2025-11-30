//(src/app/teams/[teamId]/components/qna/QnACommentItem.tsx)

"use client";

import UserAvatar from "@/components/UserAvatar";
import { timeAgoModern } from "@/utils/date";
import { useUser } from "@/context/UserContext";

export default function QnACommentItem({
  comment,
  toggleLike,
  setShowDeleteModal,
  setTargetCommentId,
}: any) {
  const { user: currentUser } = useUser();

  return (
    <div className="flex gap-2">
      <UserAvatar
        userId={comment.userId}
        size={30}
        name={comment.authorNickname}
      />

      <div className="flex-1">
        <p className="text-sm">{comment.text}</p>

        <div className="mt-1 flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {timeAgoModern(comment.createdAt)}
          </span>

          <button
            onClick={() => toggleLike(comment.id)}
            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
          >
            ❤️ {comment.likeCount ?? 0}
          </button>

          {currentUser?.uid === comment.userId && (
            <button
              className="text-xs text-red-500 hover:underline"
              onClick={() => {
                setTargetCommentId(comment.id);
                setShowDeleteModal(true);
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
