// src/app/live/match/[sport]/[liveId]/components/ChatRoom.tsx

'use client';

import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/context/UserContext';
import FloatingEmojiLayer from "@/app/live/[sport]/[liveId]/components/FloatingEmojiLayer";

interface ChatRoomProps {
  sport: string;
  liveId: string;
  matchStatus: 'Scheduled' | 'LIVE' | 'END';
}

interface Message {
  id: string;
  userId: string;   // 🔥 추가
  user: string;
  text: string;
  timestamp?: string | Date;
}

const NAME_COLORS = [
  "text-blue-400", "text-red-400", "text-green-400",
  "text-yellow-400", "text-purple-400", "text-orange-400"
];

export default function ChatRoom({ sport, liveId }: ChatRoomProps) {
  console.log("ChatRoom params:", sport, liveId); 
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const emojiLayerRef = useRef<any>(null);

  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [bottomPadding, setBottomPadding] = useState(120); // 초기값 아무거나

  useEffect(() => {
    if (!bottomBarRef.current) return;

    const updatePadding = () => {
      if (!bottomBarRef.current) return;
      const rect = bottomBarRef.current.getBoundingClientRect();
      const padding = window.innerHeight - rect.top + 8; 
      setBottomPadding(padding);
    };

    const obs = new ResizeObserver(updatePadding);
    obs.observe(bottomBarRef.current);

    window.addEventListener("resize", updatePadding);

    // 🔥 cleanup 함수는 여기 딱 한 번만 있어야 함
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", updatePadding);
    };
  }, []);

  /** 🔥 실시간 메시지 구독 */
  useEffect(() => {
    const q = query(
      collection(db, "live_events", sport, "events", liveId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          userId: d.userId, 
          user: d.user,
          text: d.text,
          timestamp: d.timestamp instanceof Timestamp ? d.timestamp.toDate() : d.timestamp,
        };
      });
      setMessages(list);
    });

    return () => unsub();
  }, [sport, liveId]);

  /** 자동 스크롤 (사용자 위 스크롤 시 방해 안함) */
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const nearBottom =
      Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 50;

    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  /** 🔥 Floating Emoji (항상 화면 기준) */
  const spawnEmoji = (emoji: string) => {
    const x = window.innerWidth * 0.3 + Math.random() * window.innerWidth * 0.4;
    const y = window.innerHeight - 110;
    emojiLayerRef.current?.spawn(emoji, x, y);
  };

  /** 메시지 전송 */
  const sendMessage = async (text: string) => {
    if (!user) return;

    const now = Date.now();
    if ((window as any).__lastMsg && now - (window as any).__lastMsg < 700) {
      return; // flood control
    }
    (window as any).__lastMsg = now;

    await fetch(`/api/live/${sport}/${liveId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.userId,     
        user: user.authorNickname ?? "guest",
        text,
      }),
    });
  };

  return (
    <div className="flex flex-col h-full">

      {/* 메시지 리스트 */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-3"
        style={{ paddingBottom: bottomPadding }}

      >
        <div className="flex flex-col space-y-2">
          {messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const sameUser = prev?.user === msg.user;
            const isMe = msg.userId === user?.userId;


            return (
              <div key={msg.id}>
                
                {!sameUser && (
                  <div
                    className={`
                      text-[13px] font-semibold
                      ${isMe ? "text-orange-500" : "text-blue-500"}
                    `}
                  >
                    {msg.user}
                  </div>
                )}

                <div
                  className={`
                    text-[15px]
                    ${sameUser ? "ml-3" : ""}
                  `}
                >
                  {msg.text}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Action Bar */}
        <div
          ref={bottomBarRef}
          className="
            fixed bottom-0 left-0 right-0
            backdrop-blur-xl bg-background/70
            border-t border-border
            px-2 py-1.5
            flex flex-col gap-1
            z-[20]
          "
        >
          {/* Reaction Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-0 scrollbar-hide">
            {['🔥','👏','😂','😍','😡'].map((e) => (
              <button
                key={e}
                onClick={() => spawnEmoji(e)}
                className="min-w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/40 active:scale-90 transition"
              >
                {e}
              </button>
            ))}
          </div>

          {/* Message Input Row */}
          <div className="relative w-full">
            <input
              id="chat_input"
              type="text"
              className="
                w-full bg-muted/30 rounded-full px-4 
                pr-16
                py-2 
                text-base   /* 👈 text-sm(=14px) 대신 text-base(=16px) */
                focus:outline-none
              "
              placeholder="Type a message…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    sendMessage(input.value.trim());
                    input.value = "";
                  }
                }
              }}
            />

            <button
              onClick={() => {
                const input = document.querySelector('#chat_input') as HTMLInputElement;
                if (input?.value.trim()) {
                  sendMessage(input.value.trim());
                  input.value = "";
                }
              }}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                w-10 h-10 rounded-full bg-primary text-primary-foreground
                flex items-center justify-center active:scale-90
              "
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>

      {/* Floating Emoji Layer */}
      <FloatingEmojiLayer ref={emojiLayerRef} />

    </div>
  );
}
