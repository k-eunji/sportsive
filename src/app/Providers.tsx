// src/app/Providers.tsx

"use client";

import { ReactNode } from "react";

import { UserProvider } from "@/context/UserContext";
import { MessagePopupProvider } from "@/context/MessagePopupContext";
import { NotificationProvider } from "@/context/NotificationContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <MessagePopupProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </MessagePopupProvider>
    </UserProvider>
  );
}
