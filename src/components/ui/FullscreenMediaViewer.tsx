//src/components/ui/FullscreenMediaViewer.tsx

"use client";

import React from "react";

export default function FullscreenMediaViewer({
  open,
  onClose,
  url,
  type,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  type: string;
}) {
  if (!open) return null;

  const isVideo = type.startsWith("video");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
    >
      {!isVideo ? (
        <img
          src={url}
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <video
          src={url}
          className="max-w-full max-h-full object-contain"
          controls
          autoPlay
        />
      )}
    </div>
  );
}
