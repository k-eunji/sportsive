// src/hooks/useShare.ts

"use client";

import { useState } from "react";
import {
  buildTwitterShareUrl,
  buildTelegramShareUrl,
  buildWhatsAppShareUrl,
  buildInstagramAppUrl,
} from "@/utils/shareUtils";

export function useShare() {
  const [toastVisible, setToastVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  function showToast() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500);
  }

  async function share(url: string, text?: string) {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: text ?? "Sportsive",
          text,
          url,
        });
      } catch {}
      return;
    }

    navigator.clipboard.writeText(url);
    showToast();
  }

  function shareTwitter(url: string, text?: string) {
    window.open(buildTwitterShareUrl(url, text), "_blank");
  }

  function shareTelegram(url: string, text?: string) {
    window.open(buildTelegramShareUrl(url, text), "_blank");
  }

  function shareWhatsApp(url: string, text?: string) {
    window.open(buildWhatsAppShareUrl(url, text), "_blank");
  }

  function shareInstagram(url: string) {
    // 모바일 앱 실행 시도
    const appUrl = buildInstagramAppUrl();
    window.location.href = appUrl;

    // 웹의 경우 앱이 안 열림 → 링크 복사 안내
    setTimeout(() => {
      navigator.clipboard.writeText(url);
      showToast();
    }, 500);
  }

  function copy(url: string) {
    navigator.clipboard.writeText(url);
    showToast();
  }

  return {
    share,
    shareTwitter,
    shareTelegram,
    shareWhatsApp,
    shareInstagram,
    copy,
    toastVisible,
    modalOpen,
    setModalOpen,
  };
}
