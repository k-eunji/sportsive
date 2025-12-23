///src/app/meetups/[meetupId]/components/ImagePreviewModal.tsx

"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

const typeEmoji = {
  match_attendance: "🏟️",
  pub_gathering: "🍺",
  online_game: "🎮",
  pickup_sports: "🏐",
  other: "❓",
};

export default function ImagePreviewModal({
  open,
  onClose,
  imageUrl,
  meetupType = "other",
}: {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
  meetupType?: keyof typeof typeEmoji;
}) {
  const icon = typeEmoji[meetupType] ?? "❓";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-black/90 border-none max-w-3xl">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>

        <div className="relative w-full h-[70vh] bg-black flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Full preview"
              fill
              className="object-contain"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center text-white text-7xl">
              {icon}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
