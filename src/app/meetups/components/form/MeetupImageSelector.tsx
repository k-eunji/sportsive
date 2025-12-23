// src/app/meetups/components/form/MeetupImageSelector.tsx

"use client";

import Image from "next/image";
import type { Dispatch, SetStateAction, ChangeEvent } from "react";

interface MeetupImageSelectorProps {
  autoImageUrl: string;
  customImage: File | null;
  setCustomImage: Dispatch<SetStateAction<File | null>>;
}

export function MeetupImageSelector({
  autoImageUrl,
  customImage,
  setCustomImage,
}: MeetupImageSelectorProps) {


  const src = customImage
    ? URL.createObjectURL(customImage)
    : autoImageUrl || null;

  return (
    <div className="mt-8">
      <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
        Cover Image
      </p>

      <div className="relative w-full h-48 border border-gray-300 rounded-xl overflow-hidden">
        {customImage ? (
          <img
            src={URL.createObjectURL(customImage)}
            alt="cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : autoImageUrl ? (
          <Image
            src={autoImageUrl}
            alt="cover"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-5xl">
            🏟️
          </div>
        )}
      </div>

      <div className="flex justify-between mt-3 text-[14px]">
        <label className="text-black underline cursor-pointer">
          Upload image
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && setCustomImage(e.target.files[0])
            }
          />
        </label>

        {customImage && (
          <button
            type="button"
            onClick={() => setCustomImage(null)}
            className="text-red-500 underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
