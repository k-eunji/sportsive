//src/app/components/home/BottomSheet.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function BottomSheet({
  open,
  onOpenChange,
  peek = 96,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  peek?: number; // 닫혔을 때 보이는 높이(px)
  children: React.ReactNode;
}) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    // 열려 있으면 드래그 오프셋 초기화
    if (open) setDragY(0);
  }, [open]);

  const translateY = useMemo(() => {
    // 닫힘: 화면 아래로 대부분 내려가고 peek만 남김
    // 열림: 0
    const base = open ? 0 : Math.max(0, window.innerHeight - peek);
    return Math.max(0, base + dragY);
  }, [open, dragY, peek]);

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    const diff = e.clientY - startY.current;
    // 열림 상태에서는 아래로만, 닫힘 상태에서는 위로만 부드럽게 허용
    if (open) setDragY(Math.max(0, diff));
    else setDragY(Math.min(0, diff));
  };

  const onPointerUp = () => {
    const y = dragY;
    startY.current = null;

    // 스냅
    if (open) {
      // 아래로 충분히 끌면 닫기
      if (y > 90) onOpenChange(false);
      setDragY(0);
    } else {
      // 위로 충분히 끌면 열기
      if (y < -70) onOpenChange(true);
      setDragY(0);
    }
  };

  return (
    <>
      {/* 딤은 열렸을 때만 */}
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => onOpenChange(false)}
          aria-label="Close sheet"
        />
      )}

      <div
        className="fixed left-0 right-0 bottom-0 z-50"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: startY.current ? "none" : "transform 180ms ease-out",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="rounded-t-3xl bg-background/95 backdrop-blur border-t shadow-lg">
            {/* grabber */}
            <div
              className="flex justify-center py-2"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
