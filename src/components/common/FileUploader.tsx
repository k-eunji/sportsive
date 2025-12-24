// src/components/common/FileUploader.tsx

"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { storage } from "@/lib/firebaseClient";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function FileUploader({
  onUploaded,
}: {
  onUploaded: (data: { url: string; type: string }) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);

    try {
      const fileRef = ref(
        storage,
        `uploads/${Date.now()}-${file.name}`
      );

      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      onUploaded({
        url,
        type: file.type,
      });
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {uploading && (
        <p className="text-sm text-purple-600 font-medium">
          Uploading...
        </p>
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

            if (file.size > 20 * 1024 * 1024) {
              alert("File size must be under 20MB.");
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
