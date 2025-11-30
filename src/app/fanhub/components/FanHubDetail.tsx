// src/app/fanhub/components/FanHubDetail.tsx

"use client";

import FanHubTalkItem from "./FanHubTalkItem";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import EditPostModal from "@/components/ui/EditPostModal";

import { useFanHubDetail } from "./FanHubDetail/useFanHubDetail";
import FanHubDetailMenu from "./FanHubDetail/FanHubDetailMenu";

export default function FanHubDetail({ id }: { id: string }) {
  const {
    message,
    isMine,
    menuOpen,
    setMenuOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    handleDelete,
    editModalOpen,
    setEditModalOpen,
    handleEdit,
  } = useFanHubDetail(id);

  if (!message) return <p>Loading...</p>;

  return (
    <div className="relative max-w-2xl mx-auto py-4">
      <FanHubDetailMenu
        isMine={isMine}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        setEditModalOpen={setEditModalOpen}
      />

      <FanHubTalkItem message={message} isDetail={true} />


      {/* Delete Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

      {/* Edit Modal */}
      <EditPostModal
        open={editModalOpen}
        initialText={message.text}
        onCancel={() => setEditModalOpen(false)}
        onSave={handleEdit}
      />
    </div>
  );
}
