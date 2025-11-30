// src/app/teams/[teamId]/components/TeamClubTalk

"use client";

import useClubTalk from "./hooks/useFanTalk";
import FanTalkInput from "./FanTalkInput";
import FanTalkItem from "./FanTalkItem";

export default function FanTalk({ teamId }: { teamId: string }) {
  const {
    messages,
    text,
    setText,
    loading,
    sendMessage,
    deleteMessage,
  } = useClubTalk(teamId);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Club Talk 💬</h2>

      <FanTalkInput
        text={text}
        setText={setText}
        send={sendMessage}
      />

      <div className="space-y-5">
        {messages.map((msg) => (
          <FanTalkItem
            key={msg.id}
            message={msg}
            onDelete={() => deleteMessage(msg.id)}
          />
        ))}
      </div>
    </div>
  );
}
