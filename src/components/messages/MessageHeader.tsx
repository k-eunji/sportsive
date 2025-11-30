//src/components/messages/MessageHeader.tsx

"use client";

import { ArrowLeft, X } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

interface MessageHeaderProps {
  onClose: () => void;
  onBack?: () => void;
  recipient?: {
    userId: string;
    nickname?: string;
  } | null;
}

export default function MessageHeader({
  onClose,
  onBack,
  recipient,
}: MessageHeaderProps) {
  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-border sticky top-0 bg-background z-10">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {recipient ? (
          <div className="flex items-center gap-2 min-w-0">
            <UserAvatar
              userId={recipient.userId}
              size={32}
              showName={false}
              linkToProfile={false}
            />
            <span className="font-medium text-sm text-foreground truncate">
              {recipient.nickname ?? recipient.userId}
            </span>
          </div>
        ) : (
          <span className="font-semibold text-foreground">Messages</span>
        )}
      </div>

      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}
