//src/components/share/Toast.tsx

"use client";

import { useEffect } from "react";

export default function Toast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="
      fixed bottom-20 left-1/2 -translate-x-1/2 
      bg-black text-white text-sm
      px-4 py-2 rounded-lg shadow-lg 
      z-[999] animate-fade-in
    ">
      {message}
    </div>
  );
}
