// src/context/MessagePopupContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface MessagePopupContextType {
  show: boolean;
  toUserId?: string;
  open: (userId?: string) => void;
  close: () => void;
}

const MessagePopupContext = createContext<MessagePopupContextType | null>(null);

export function MessagePopupProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  const [toUserId, setToUserId] = useState<string | undefined>();

  const open = (userId?: string) => {
    setToUserId(userId);
    setShow(true);
  };

  const close = () => setShow(false);

  return (
    <MessagePopupContext.Provider value={{ show, toUserId, open, close }}>
      {children}
    </MessagePopupContext.Provider>
  );
}

export function useMessagePopup() {
  const ctx = useContext(MessagePopupContext);
  if (!ctx) throw new Error("useMessagePopup must be used within MessagePopupProvider");
  return ctx;
}
