// src/hooks/useShare.ts

"use client";

import { useState } from "react";
import {
  nativeShare,
  copyToClipboard,
  canNativeShare,
} from "@/utils/shareUtils";

export function useShare() {
  const [toastVisible, setToastVisible] = useState(false);

  function showToast() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500);
  }

  /**
   * Main share action
   * - Mobile → OS native share (Instagram DM, WhatsApp, iMessage, etc)
   * - Desktop → copy link
   */
  async function share(url: string, text?: string) {
    const usedNative = await nativeShare({ url, text });

    if (!usedNative) {
      await copyToClipboard(url);
      showToast();
    }
  }

  return {
    share,
    toastVisible,
  };
}
