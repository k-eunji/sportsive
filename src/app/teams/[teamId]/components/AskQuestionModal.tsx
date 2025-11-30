// src/app/teams/[teamId]/components/AskQuestionModal.tsx

"use client";

import { useState, useEffect } from "react";

export default function AskQuestionModal({ open, onClose, onSubmit }: any) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // 모달 열릴 때 내부 상태 초기화
  useEffect(() => {
    if (open) {
      setText("");
      setImageFile(null);
      setPreview(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleImageChange(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-md shadow-lg max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-3">Ask a Question</h2>

        <textarea
          className="w-full border rounded-lg p-3 text-sm bg-background"
          placeholder="Write your question..."
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* 이미지 업로드 */}
        <div className="mt-3">
          <label className="text-sm font-medium">Attach Image (optional)</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2 text-sm"
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-2 rounded-lg object-cover border max-h-[120px] w-auto mx-auto"
            />
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-1.5 rounded-lg text-sm bg-gray-200 dark:bg-neutral-700"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-1.5 rounded-lg text-sm bg-blue-600 text-white"
            onClick={async () => {
              await onSubmit(text, imageFile);
              onClose();           // ← 모달 닫히도록 수정
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
