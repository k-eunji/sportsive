//(src/app/teams/[teamId]/components/qna/QnAComments.tsx)

"use client";

import QnACommentItem from "./QnACommentItem";

export default function QnAComments({
  comments,
  toggleLike,
  setShowDeleteModal,
  setTargetCommentId,
}: any) {
  return (
    <div className="space-y-4 mt-4">
      {comments.length === 0 && (
        <p className="text-sm text-gray-400 italic">No answers yet.</p>
      )}

      {comments.map((c: any) => (
        <QnACommentItem
          key={c.id}
          comment={c}
          toggleLike={toggleLike}
          setShowDeleteModal={setShowDeleteModal}
          setTargetCommentId={setTargetCommentId}
        />
      ))}
    </div>
  );
}
