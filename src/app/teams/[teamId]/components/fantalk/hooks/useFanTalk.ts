// src/app/teams/[teamId]/components/fantalk/hooks/useFanTalk.ts

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { uploadToStorage } from "@/lib/uploadToStorage";


export default function useFanTalk(teamId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/teams/${teamId}/fantalk/list`, {
      cache: "no-store",
    });
    setMessages(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function sendMessage(imageFile?: File | null) {
    if (!user || !text.trim()) return;

    let imageUrl = null;

    // 이미지 업로드
    if (imageFile) {
    imageUrl = await uploadToStorage(imageFile);
  }


    await fetch(`/api/teams/${teamId}/fantalk/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        imageUrl,
        userId: user.uid,
        authorNickname: user.authorNickname,
      }),
    });

    setText("");
    load();
  }

  async function deleteMessage(id: string) {
    await fetch(`/api/teams/${teamId}/fantalk/${id}/delete`, {
      method: "POST",
    });
    load();
  }

  return {
    messages,
    text,
    setText,
    loading,
    sendMessage,
    deleteMessage,
    load,
  };
}
