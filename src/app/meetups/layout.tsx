// src/app/meetups/layout.tsx

"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MeetupsLayout({ children }: any) {
  const pathname = usePathname();
  const isFeed = pathname === "/meetups";
  const isMyMeetups = pathname === "/meetups/my";

  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(!(y > lastY && y > 60));
      setLastY(y);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  return (
    <div>
      {/* HEADER */}
      <div
        className="
        fixed left-0 right-0 top-[50px] z-40
        bg-[var(--background)]
        border-b border-[var(--border)]
        transition-transform duration-300
      "
        style={{
          transform: visible ? "translateY(0)" : "translateY(-102px)",
        }}
      >
        <div className="max-w-2xl mx-auto flex h-[52px] items-center">
          <Link href="/meetups" className="flex-1 flex justify-center">
            <span
              className={`px-4 py-2 rounded-full text-sm ${
                isFeed
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Meetups
            </span>
          </Link>

          <Link
            href="/meetups/my"
            className="flex-1 flex justify-center"
            onClick={(e) => {
              e.preventDefault();     // 페이지 이동 막기
              alert("Coming soon!");  // 준비중 알림
            }}
          >
            <span
              className={`px-4 py-2 rounded-full text-sm ${
                isMyMeetups
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              My Meetups
            </span>
          </Link>

        </div>
      </div>

      <div className="pt-[10px] px-3">{children}</div>
    </div>
  );
}
