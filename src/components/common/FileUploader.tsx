// src/components/common/FileUploader.tsx

// src/components/common/FileUploader.tsx

"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";

export default function FileUploader({
  onUploaded,
}: {
  onUploaded: (data: { url: string; type: string }) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const upload = async (file: File) => {
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await res.json();

      onUploaded({
        url,
        type: file.type,
      });
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false); // 🔥 이 줄이 제일 중요
    }
  };

  return (
    <div className="space-y-2">

      {uploading && (
        <p className="text-sm text-purple-600 font-medium">Uploading...</p>
      )}

      {preview && (
        <div className="relative mb-2">
          {isVideo ? (
            <video
              src={preview}
              className="rounded-lg max-h-60 w-full object-cover"
              controls
            />
          ) : (
            <img
              src={preview}
              className="rounded-lg max-h-60 w-full object-cover"
            />
          )}

          {!uploading && (
            <button
              onClick={() => {
                setPreview(null);
                setIsVideo(false);
              }}
              className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
        <Upload size={18} />
        <span>{uploading ? "Uploading..." : "Upload image or video"}</span>

        <input
          type="file"
          accept="image/*,video/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
              alert("File size must be under 5MB.");
              return;
            }

            const url = URL.createObjectURL(file);

            setPreview(url);
            setIsVideo(file.type.startsWith("video"));

            upload(file);
          }}

        />
      </label>
    </div>
  );
}
