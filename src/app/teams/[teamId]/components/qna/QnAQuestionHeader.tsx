//(src/app/teams/[teamId]/components/qna/QnAQuestionHeader.tsx)

"use client";

import UserAvatar from "@/components/UserAvatar";
import MoreMenu from "@/components/ui/MoreMenu";
import { timeAgoModern } from "@/utils/date";
import QnAQuestionImage from "./QnAQuestionImage";

export default function QnAQuestionHeader({
  question,
  editMode,
  editText,
  setEditText,
  setEditMode,
  saveEdit,
  setShowDeleteModal,
}: any) {
  return (
    <div className="flex items-start gap-3">
      <UserAvatar
        userId={question.data.userId}
        name={question.data.authorNickname}
        size={42}
        showName={false}
      />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{question.data.authorNickname}</p>
            <span className="text-gray-500 text-sm">
              · {timeAgoModern(question.createdAt)}
            </span>
            {question.editedAt && (
              <span className="text-gray-400 text-xs">(edited)</span>
            )}
          </div>

          <MoreMenu
            onEdit={() => setEditMode(true)}
            onDelete={() => setShowDeleteModal(true)}
            type="question"
          />
        </div>

        {editMode ? (
          <div className="mt-2">
            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />

            <div className="flex gap-2 mt-2">
              <button
                className="px-4 py-1.5 bg-gray-200 rounded-lg text-sm"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1">{question.data.question}</p>
        )}

        <QnAQuestionImage imageUrl={question.data.imageUrl} />
      </div>
    </div>
  );
}
