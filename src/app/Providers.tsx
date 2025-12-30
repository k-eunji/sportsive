// src/app/Providers.tsx

'use client';

import { ReactNode } from 'react';

import { UserProvider, useUser } from '@/context/UserContext';
import { MessagePopupProvider } from '@/context/MessagePopupContext';
import { NotificationProvider } from '@/context/NotificationContext';

function AuthGate({ children }: { children: ReactNode }) {
  const { authReady } = useUser();

  // 🔒 Auth 초기화 전에는 아무것도 렌더링하지 않음
  if (!authReady) {
    return null; // 필요하면 로딩 컴포넌트
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <AuthGate>
        <MessagePopupProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </MessagePopupProvider>
      </AuthGate>
    </UserProvider>
  );
}
