// src/app/community/components/ToastArea.tsx
"use client";

import { Toaster } from "sonner";

/**
 * ✅ 글로벌 토스트 컴포넌트
 * - 포인트 획득, 게시 성공, 팔로우 알림 등 표시
 */
export default function ToastArea() {
  return <Toaster position="bottom-right" richColors />;
}
