//src/app/fanhub/components/FanHubDetail/useFanHubDetail.ts)

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export function useFanHubDetail(id: string) {
  const [message, setMessage] = useState<any>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  // 게시물 불러오기
  useEffect(() => {
    fetch(`/api/fanhub/${id}`)
      .then((r) => r.json())
      .then(setMessage);
  }, [id]);

  const isMine = user?.uid === message?.userId;

  // 🔥 삭제 처리
  const handleDelete = async () => {
    await fetch(`/api/fanhub/${id}/delete`, { method: "POST" });

    router.back();
    setTimeout(() => router.push("/fanhub"), 500);
  };

  // 🔥 수정 처리
  const handleEdit = async (newText: string) => {
    await fetch(`/api/fanhub/${id}/edit`, {
      method: "POST",
      body: JSON.stringify({ text: newText }),
    });

    // UI 갱신
    setMessage((prev: any) => ({ ...prev, text: newText }));
    setEditModalOpen(false);
  };

  return {
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
  };
}
