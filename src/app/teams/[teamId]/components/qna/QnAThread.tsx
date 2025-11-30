//(src/app/teams/[teamId]/components/qna/QnAThread.tsx)

"use client";

import QnAQuestionHeader from "./QnAQuestionHeader";
import QnAComments from "./QnAComments";
import QnACommentInput from "./QnACommentInput";
import ReplyToggleBar from "@/components/ui/ReplyToggleBar";
import ExpandableThread from "@/components/ui/ExpandableThread";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { useState } from "react";
import useQnAComments from "./hooks/useQnAComments";
import useQnAEdit from "./hooks/useQnAEdit";

export default function QnAThread({ question, teamId }: any) {
  const qaId = question.id;

  const {
    comments,
    loadComments,
    toggleLike,
    sendComment,
    deleteComment,
    text,
    setText,
  } = useQnAComments(teamId, qaId, question);

  const {
    editMode,
    editText,
    setEditText,
    setEditMode,
    saveEdit,
    deleteQuestion,
  } = useQnAEdit(question, teamId, qaId);

  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetCommentId, setTargetCommentId] = useState<string | null>(null);

  return (
    <div className="py-6 flex justify-center border-b">
      <div className="w-full max-w-[600px] px-4">

        <QnAQuestionHeader
          question={question}
          editMode={editMode}
          editText={editText}
          setEditText={setEditText}
          setEditMode={setEditMode}
          saveEdit={saveEdit}
          setShowDeleteModal={setShowDeleteModal}
        />

        <ReplyToggleBar
          count={question.answerCount}
          open={open}
          onToggle={() => setOpen(!open)}
        />

        <ExpandableThread open={open}>
          <QnAComments
            comments={comments}
            toggleLike={toggleLike}
            setShowDeleteModal={setShowDeleteModal}
            setTargetCommentId={setTargetCommentId}
          />

          <QnACommentInput
            text={text}
            setText={setText}
            send={sendComment}
          />
        </ExpandableThread>

        <DeleteConfirmModal
          open={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => {
            if (targetCommentId) deleteComment(targetCommentId);
            else deleteQuestion();
            setShowDeleteModal(false);
          }}
        />

      </div>
    </div>
  );
}
