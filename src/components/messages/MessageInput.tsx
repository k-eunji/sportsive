// src/components/messages/MessageInput.tsx

"use client";
import { Send } from "lucide-react";

export default function MessageInput({
  input,
  setInput,
  handleSend,
}: {
  input: string;
  setInput: (v: string) => void;
  handleSend: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="
        sticky bottom-0 flex items-center gap-2 border-t border-border bg-background
        px-2 py-2 transition-all
      "
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom) + 4px)",
        minHeight: "56px", // ✅ 고정 높이 (입력창이 커지지 않음)
        flexShrink: 0,
      }}
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        inputMode="text"
        style={{
          height: "36px", // ✅ 입력창 세로 고정
          fontSize: "16px", // ✅ iOS 자동 줌 방지
        }}
        className="
          flex-1 rounded-full border border-input bg-muted text-foreground
          px-3 py-2 text-sm placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary
          overflow-hidden resize-none
        "
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <button
        type="submit"
        style={{
          flexShrink: 0, // ✅ 버튼이 밀리지 않게
          height: "36px", // ✅ 버튼 높이도 입력창과 동일
        }}
        className="
          flex items-center justify-center rounded-full bg-primary text-primary-foreground
          px-4 text-sm transition-colors hover:bg-primary/90 active:scale-[0.98]
        "
      >
        <Send size={16} />
      </button>
    </form>
  );
}
