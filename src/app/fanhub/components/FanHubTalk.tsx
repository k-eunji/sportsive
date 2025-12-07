// src/app/fanhub/components/FanHubTalk.tsx

"use client";

import { useEffect, useState } from "react";
import useFanHubTalk from "../hooks/useFanHubTalk";
import FanHubTalkItem from "./FanHubTalkItem";
import FanHubTalkInput from "./FanHubTalkInput";

export default function FanHubTalk() {
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("latest");

  // ✅ useSearchParams 제거 → window.location.search 사용
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const tagParam = params.get("tag") || "";
    const sortParam = params.get("sort") || "latest";

    setTag(tagParam);
    setSort(sortParam);
  }, []);

  const {
    messages,
    text,
    setText,
    loading,
    sendMessage,
    deleteMessage,
  } = useFanHubTalk(tag, sort);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col">

      <h2 className="text-xl font-bold">
        {sort === "hot" ? "🔥" : sort === "trending" ? "📈" : "🕒"}
      </h2>

      <FanHubTalkInput
        text={text}
        setText={setText}
        send={sendMessage}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {messages.map((msg) => (
          <FanHubTalkItem
            key={msg.id}
            message={msg}
            onDelete={() => deleteMessage(msg.id)}
          />
        ))}
      </div>
    </div>
  );
}
