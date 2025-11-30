// src/components/buttons/MessageButton.tsx

"use client";

import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MessageButton({ toUserId }: { toUserId: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/messages?to=${toUserId}`)}
      className="
        flex items-center gap-2
        rounded-full
        bg-primary text-primary-foreground
        text-sm font-medium
        px-3 py-1.5
        transition-colors
        hover:bg-primary/90
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        active:scale-[0.98]
      "
    >
      <MessageSquare size={16} />
      Message
    </button>
  );
}
