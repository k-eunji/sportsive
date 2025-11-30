// src/app/teams/[teamId]/components/fantalk/FanTalkItem

"use client";

import UserAvatar from "@/components/UserAvatar";
import { timeAgoModern } from "@/utils/date";
import { useUser } from "@/context/UserContext";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { useState } from "react";

export default function FanTalkItem({ message, onDelete }: any) {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex gap-3 border-b pb-4">
      <UserAvatar
        userId={message.userId}
        name={message.authorNickname}
        size={36}
        showName={false}
      />

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="font-semibold">{message.authorNickname}</p>
          <span className="text-xs text-gray-500">
            {timeAgoModern(message.createdAt)}
          </span>
        </div>

        <p className="text-sm mt-1 whitespace-pre-line">{message.text}</p>

        {message.imageUrl && (
          <img
            src={message.imageUrl}
            className="mt-2 rounded-lg max-h-60 object-cover border"
            alt="attachment"
          />
        )}

        {/* 삭제 버튼 */}
        {user?.uid === message.userId && (
          <button
            className="text-xs text-red-500 mt-2"
            onClick={() => setShowModal(true)}
          >
            Delete
          </button>
        )}

        <DeleteConfirmModal
          open={showModal}
          onCancel={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            onDelete();
          }}
        />
      </div>
    </div>
  );
}
