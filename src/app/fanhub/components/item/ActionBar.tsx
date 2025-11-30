//src/app/fanhub/components/item/ActionBar.tsx

"use client";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useShare } from "@/hooks/useShare";
import ShareModal from "@/components/share/ShareModal";
import Toast from "@/components/share/Toast";

export default function ActionBar({
  likeCount = 0,
  commentCount = 0,
  onCommentClick,
  onLike,
  isLiked = false,
  shareUrl,
  shareText,
}: {
  likeCount?: number;
  commentCount?: number;
  onCommentClick?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
  shareUrl: string;
  shareText?: string;
}) {
  const {
    share,
    shareTwitter,
    shareTelegram,
    shareWhatsApp,     // ⭐ 추가해야 함
    shareInstagram,    // ⭐ 추가해야 함
    copy,
    toastVisible,
    modalOpen,
    setModalOpen,
  } = useShare();

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      share(shareUrl, shareText);
      return;
    }
    setModalOpen(true);
  }

  return (
    <>
      <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400 mb-2">
        <button
          onClick={onLike}
          className={`flex items-center gap-1 transition ${
            isLiked ? "text-red-500" : "hover:text-red-500"
          }`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={onCommentClick}
          className="flex items-center gap-1 hover:text-blue-500 transition"
        >
          <MessageCircle size={18} /> <span>{commentCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 hover:text-green-600 transition"
        >
          <Share2 size={18} />
        </button>
      </div>

      <ShareModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCopy={() => copy(shareUrl)}
        onTwitter={() => shareTwitter(shareUrl, shareText)}
        onTelegram={() => shareTelegram(shareUrl, shareText)}
        onWhatsApp={() => shareWhatsApp(shareUrl, shareText)}   // ⭐ 추가
        onInstagram={() => shareInstagram(shareUrl)}            // ⭐ 추가
      />

      <Toast visible={toastVisible} message="Link copied!" />
    </>
  );
}
