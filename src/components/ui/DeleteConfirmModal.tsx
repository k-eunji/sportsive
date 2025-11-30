//src/components/ui/DeleteConfirmModal.tsx

"use client";
import React from "react";

export default function DeleteConfirmModal({ open, onCancel, onConfirm }: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl text-center">
        <h2 className="text-lg font-semibold mb-2">Delete</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          Are you sure you want to delete this? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-neutral-700 text-sm"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
