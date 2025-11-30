 //src/components/messages/MessagePopup.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useUser } from "@/context/UserContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

import MessageHeader from "./MessageHeader";
import MessageInbox from "./MessageInbox";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

dayjs.extend(relativeTime);

interface MessagePopupProps {
  onClose: () => void;
  toUserId?: string;
}

export default function MessagePopup({ onClose, toUserId }: MessagePopupProps) {
  const { user } = useUser();
  const [inbox, setInbox] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [currentToUser, setCurrentToUser] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  

  // ✅ 받은 메시지함 로드
  const fetchInbox = async () => {
    if (!user) return;
    setIsLoadingInbox(true);
    const res = await fetch("/api/messages/inbox", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    if (res.ok) setInbox(await res.json());
    setIsLoadingInbox(false);
  };
  useEffect(() => {
    fetchInbox();
  }, [user]);

  const openConversation = async (convId: string) => {
    const convo = inbox.find((c) => c.id === convId);
    setCurrentToUser(convo?.otherUserId || null);
    setSelected(convId);
    setMessages([]);
    try {
      await fetch(`/api/messages/${convId}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setInbox((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error("❌ Failed to mark as read:", err);
    }
  };

  // ✅ Firestore 실시간 메시지 구독
  useEffect(() => {
    if (!selected || !user) return;
    const q = query(
      collection(db, "conversations", selected, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return { id: d.id, ...data, isMine: data.from === user.userId };
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [selected, user]);

  // ✅ 새 대화 자동 생성
  useEffect(() => {
    if (!toUserId || !user) return;
    (async () => {
      try {
        const res = await fetch("/api/messages/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ to: toUserId }),
        });
        if (res.ok) {
          const data = await res.json();
          setSelected(data.conversationId);
        }
      } catch (err) {
        console.error("❌ Error creating conversation:", err);
      }
    })();
  }, [toUserId, user]);

  const handleSend = async () => {
    if (!input.trim() || !user || !selected) return;
    let recipientId = currentToUser || toUserId;
    if (!recipientId && messages.length > 0) {
      const last = messages[messages.length - 1];
      recipientId = last.from === user.userId ? last.to : last.from;
    }
    if (!recipientId) return;

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        to: recipientId,
        text: input.trim(),
        conversationId: selected,
      }),
    });
    if (res.ok) {
      const newMsg = await res.json();
      setMessages((prev) =>
        prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
      );
      setInput("");
    }
  };

  const popupContent = (
    <AnimatePresence>
      // 🔽 기존 코드의 popupContent 내부 motion.div className 수정
      <motion.div
        initial={{ opacity: 0, y: isMobile ? 50 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isMobile ? 50 : -10 }}
        transition={{ duration: 0.2 }}
        className={`
          ${isMobile
            ? "fixed inset-0 z-[9999] flex flex-col bg-background overflow-hidden overflow-x-hidden"
            : "w-96 bg-background border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden"
          }
        `}
        style={
          isMobile
            ? {
                height:
                  typeof window !== "undefined" && window.visualViewport
                    ? `${window.visualViewport.height}px`
                    : "100vh",
              }
            : undefined
        }
      >

        <MessageHeader
          onClose={onClose}
          onBack={selected ? () => setSelected(null) : undefined}
          recipient={
            selected
              ? {
                  userId: currentToUser ?? "",
                  nickname: inbox.find((c) => c.id === selected)?.authorNickname,
                }
              : null
          }
        />
        {!selected ? (
          <MessageInbox
            inbox={inbox}
            user={user}
            onSelect={openConversation}
            onRefresh={fetchInbox}
            isLoading={isLoadingInbox}
          />
        ) : (
          <>
            <MessageList messages={messages} user={user} />
            <MessageInput input={input} setInput={setInput} handleSend={handleSend} />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return isMobile ? createPortal(popupContent, document.body) : popupContent;
}
