//src/app/fanhub/components/FanHubDetail/FanHubDetailMenu.tsx)

"use client";

import { useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";

export default function FanHubDetailMenu({
  isMine,
  menuOpen,
  setMenuOpen,
  setDeleteModalOpen,
}: any) {
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 → 닫기
  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  if (!isMine) return null;

  return (
    <div ref={ref} className="absolute right-2 top-2 z-20">
      <button
        onClick={() => setMenuOpen((p: boolean) => !p)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <MoreVertical size={18} />
      </button>

      {menuOpen && (
        <div
          className="absolute right-0 mt-1 w-24
                     bg-white dark:bg-neutral-800
                     border border-gray-200 dark:border-neutral-700
                     rounded-md shadow-md text-sm overflow-hidden"
        >
          <button
            onClick={() => {
              setDeleteModalOpen(true);
              setMenuOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-red-600 
                      hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
