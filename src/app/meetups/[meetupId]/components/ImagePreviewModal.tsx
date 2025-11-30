///src/app/meetups/[meetupId]/components/ImagePreviewModal.tsx

"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

export default function ImagePreviewModal({
  open,
  onClose,
  imageUrl,
}: {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-0 bg-black/90 border-none max-w-3xl">
        
        {/* 🔥 Radix 요구: Title must exist */}
        <DialogTitle className="sr-only">Image Preview</DialogTitle>

        <div className="relative w-full h-[70vh] bg-black flex items-center justify-center">
          <Image
            src={imageUrl}
            alt="Full preview"
            fill
            className="object-contain"
            unoptimized
          />
        </div>

      </DialogContent>
    </Dialog>
  );
}
