//src/components/ui/MoreMenu.tsx

"use client";
import { useState } from "react";

export default function MoreMenu({ onEdit, onDelete, type }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="text-gray-500 hover:text-gray-800 px-2"
        onClick={() => setOpen(!open)}
      >
        •••
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-neutral-800 border rounded-lg shadow-lg text-sm">
          {type === "question" && (
            <button
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              Edit
            </button>
          )}

          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
