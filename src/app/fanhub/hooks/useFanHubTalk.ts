//src/app/fanhub/hooks/useFanHubTalk.ts

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";

export default function useFanHubTalk(tag: string, sort: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  async function load() {
    setLoading(true);

    const url = `/api/fanhub/list`
      + (tag ? `?tag=${tag}` : `?tag=`)
      + `&sort=${sort}`;

    const res = await fetch(url, { cache: "no-store" });
    setMessages(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [tag, sort]);

  // -------------- 🔥 NEW sendMessage ---------------
  async function sendMessage({
    text,
    mediaUrl,
    mediaType,
    tags,
  }: {
    text: string;
    mediaUrl: string | null;
    mediaType: string | null;
    tags: string[];
  }) {
    if (!user) return;

    // ⛔ 텍스트도 없고 미디어도 없으면 업로드 금지
    if (!text.trim() && !mediaUrl) return;

    await fetch("/api/fanhub/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        mediaUrl,
        mediaType,
        userId: user.uid,
        authorNickname: user.authorNickname,
        tags,
      }),
    });

    load();
  }

  // --------------------------------------------------

  async function deleteMessage(id: string) {
    await fetch(`/api/fanhub/${id}/delete`, {
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
