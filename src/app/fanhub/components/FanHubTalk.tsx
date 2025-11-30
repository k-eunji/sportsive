//src/app/fanhub/components/FanHubTalk.tsx

//src/app/fanhub/components/FanHubTalk.tsx

"use client";

import { useSearchParams } from "next/navigation";
import useFanHubTalk from "../hooks/useFanHubTalk";
import FanHubTalkItem from "./FanHubTalkItem";
import FanHubTalkInput from "./FanHubTalkInput";

export default function FanHubTalk() {
  const params = useSearchParams() as any;
  const tag = params.get("tag") || "";
  const sort = params.get("sort") || "latest";

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

      <FanHubTalkInput text={text} setText={setText} send={sendMessage} />

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
