// src/app/fanhub/components/item/MessageMedia.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FullscreenMediaViewer from "@/components/ui/FullscreenMediaViewer";

export default function MessageMedia({
  url,
  type,
  fallbackImage,
  messageId,
  clickToOpenFull = false,   // ⭐ 상세 전용 옵션
}: {
  url?: string | null;
  type?: string | null;
  fallbackImage?: string | null;
  messageId?: string;         // ⭐ 상세에서는 필요 없음
  clickToOpenFull?: boolean;  // ⭐ 추가
}) {
  const router = useRouter();
  const finalUrl = url || fallbackImage;

  const [openFull, setOpenFull] = useState(false);

  if (!finalUrl) return null;

  const isVideo = type?.startsWith("video");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // autoplay observer는 그대로
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    const video = videoRef.current;

    const onLoad = () => {
      const observer = new IntersectionObserver(
        async (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              try {
                await video.play();
              } catch {}
            } else {
              video.pause();
            }
          }
        },
        { threshold: 0.6 }
      );

      observer.observe(video);
    };

    video.addEventListener("loadeddata", onLoad);
    return () => video.removeEventListener("loadeddata", onLoad);
  }, [isVideo]);

  // 클릭 이벤트 분기 처리
  const handleClick = (e: any) => {
    e.stopPropagation();

    if (clickToOpenFull) {
      setOpenFull(true);         // ⭐ 상세페이지: 전체화면
    } else if (messageId) {
      router.push(`/fanhub/${messageId}`);  // ⭐ 메인: 상세페이지 이동
    }
  };

  return (
    <>
      <div
        className="mt-3 rounded-xl overflow-hidden border max-h-[480px] bg-black flex justify-center items-center cursor-pointer"
        onClick={handleClick}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={finalUrl}
            className="max-h-[480px] max-w-full w-auto object-contain"
            muted
            playsInline
            autoPlay
            loop
          />
        ) : (
          <img
            src={finalUrl}
            alt="media"
            className="max-h-[480px] max-w-full w-auto object-contain"
          />
        )}
      </div>

      {/* ⭐ 전체화면 뷰어 (상세 페이지에서만 작동) */}
      {clickToOpenFull && (
        <FullscreenMediaViewer
          open={openFull}
          onClose={() => setOpenFull(false)}
          url={finalUrl}
          type={type || ""}
        />
      )}
    </>
  );
}
