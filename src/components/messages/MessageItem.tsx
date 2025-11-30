//src/components/messages/MessageItem.tsx

"use client";
import dayjs from "dayjs";

export default function MessageItem({ message, user }: any) {
  const time = message?.createdAt ? dayjs(message.createdAt).format("HH:mm") : "";
  const isMine = message?.isMine;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-3 py-2 rounded-2xl text-sm max-w-[70%] break-words flex items-end gap-2 ${
          isMine
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        <span className="whitespace-pre-line">{message?.text}</span>
        {time && (
          <span
            className={`text-[10px] leading-none ${
              isMine ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
            style={{
              alignSelf: "flex-end",
              minWidth: "28px",
              textAlign: "right",
            }}
          >
            {time}
          </span>
        )}
      </div>
    </div>
  );
}
