// src/app/fanhub/components/FanHubTalkInput.tsx

"use client";

import { useState, useEffect } from "react";
import FileUploader from "@/components/common/FileUploader";
import SportTagSelector from "./input/SportTagSelector";

type FanHubSendPayload = {
  text: string;
  mediaUrl: string | null;
  mediaType: string | null;
  tags: string[];
};

export default function FanHubTalkInput({
  text,
  setText,
  send,
}: {
  text: string;
  setText: (v: string) => void;
  send: (payload: FanHubSendPayload) => void;
}) {
  const [media, setMedia] = useState<{ url: string; type: string } | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  /** 자동 태그 추출 */
  useEffect(() => {
    const found = text.match(/#([a-zA-Z0-9_]+)/g) || [];
    const autoTags = [...new Set(found.map(t => t.slice(1).toLowerCase()))];
    setTags(autoTags);   // ← merge 하지 않음
  }, [text]);

  const handleSubmit = () => {
    send({
      text,
      mediaUrl: media?.url || null,
      mediaType: media?.type || null,
      tags,
    });

    setMedia(null);
    setTags([]);
    setText("");
  };

  return (
    <div className="pb-4 border-b dark:border-neutral-800">

      {/* Textarea + Post button (트위터 스타일) */}
      <div className="flex items-start gap-3">

        {/* 프로필 이미지 자리 */}

        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening?"
            className="
              w-full text-[15px] bg-transparent border-none outline-none
              resize-none placeholder:text-gray-500 dark:placeholder:text-gray-400
            "
            rows={2}
          />

          {/* 태그 목록 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-xs"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* 스포츠 태그 선택 */}
          <SportTagSelector tags={tags} setTags={setTags} />

          {/* 업로더 */}
          {media && (
            <div className="mt-3">
              {media.type.startsWith("video") ? (
                <video
                  src={media.url}
                  className="rounded-xl max-h-[300px] w-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={media.url}
                  className="rounded-xl max-h-[300px] w-full object-cover"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">

            {/* 좌측 아이콘들 */}
            <div className="flex items-center gap-3">
              <FileUploader onUploaded={(obj) => setMedia(obj)} />

              {/* 선택한 태그 출력 */}
              <div className="flex gap-1"></div>
            </div>

            {/* Post 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={!text.trim() && !media}
              className="
                px-4 py-1.5 rounded-full bg-purple-600 text-white text-sm font-medium
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

