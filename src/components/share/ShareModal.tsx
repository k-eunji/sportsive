//src/components/share/ShareModal.tsx

"use client";

import { X, Link2, Twitter, Send, Share2 } from "lucide-react";
import { Instagram, MessageCircle } from "lucide-react"; // ⭐ 추가

export default function ShareModal({
  open,
  onClose,
  onCopy,
  onTwitter,
  onTelegram,
  onWhatsApp,
  onInstagram,
}: {
  open: boolean;
  onClose: () => void;
  onCopy: () => void;
  onTwitter: () => void;
  onTelegram: () => void;
  onWhatsApp: () => void;     // ⭐ 추가
  onInstagram: () => void;    // ⭐ 추가
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[500] flex justify-center items-end pb-6">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-t-2xl p-5">

        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Share</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">

          {/* Copy */}
          <button onClick={onCopy} className="flex flex-col items-center">
            <div className="p-3 bg-gray-100 dark:bg-neutral-800 rounded-full">
              <Link2 />
            </div>
            <span className="text-xs mt-1">Copy</span>
          </button>

          {/* Twitter */}
          <button onClick={onTwitter} className="flex flex-col items-center">
            <div className="p-3 bg-[#1DA1F2]/10 rounded-full">
              <Twitter className="text-[#1DA1F2]" />
            </div>
            <span className="text-xs mt-1">Twitter</span>
          </button>

          {/* Telegram */}
          <button onClick={onTelegram} className="flex flex-col items-center">
            <div className="p-3 bg-[#0088cc]/10 rounded-full">
              <Send className="text-[#0088cc]" />
            </div>
            <span className="text-xs mt-1">Telegram</span>
          </button>

          {/* WhatsApp */}
          <button onClick={onWhatsApp} className="flex flex-col items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <MessageCircle className="text-green-600" />
            </div>
            <span className="text-xs mt-1">WhatsApp</span>
          </button>

          {/* Instagram */}
          <button onClick={onInstagram} className="flex flex-col items-center">
            <div className="p-3 bg-pink-100 rounded-full">
              <Instagram className="text-pink-500" />
            </div>
            <span className="text-xs mt-1">Instagram</span>
          </button>

        </div>
      </div>
    </div>
  );
}
