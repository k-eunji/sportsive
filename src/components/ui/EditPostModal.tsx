//src/components/ui/EditPostModal.tsx

"use client";

import { useState } from "react";

export default function EditPostModal({ open, initialText, onCancel, onSave }: any) {
  const [text, setText] = useState(initialText || "");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Edit Post</h2>

        <textarea
          className="w-full border rounded-lg p-2 h-24 dark:bg-neutral-800 dark:text-white"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-neutral-700 text-sm"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
            onClick={() => onSave(text)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
