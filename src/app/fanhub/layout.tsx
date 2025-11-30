//src/app/fanhub/layout.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import TodayMatchCarouselLoader from "./components/TodayMatchCarouselLoader";

interface FanHubLayoutProps {
  children: React.ReactNode;
}

export default function FanHubLayout({ children }: FanHubLayoutProps) {
  const pathname = usePathname() || "";

  const isFeed = pathname === "/fanhub";
  const isPredict = pathname.startsWith("/fanhub/predict");

  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const current = window.scrollY;
      setVisible(!(current > lastY && current > 60));
      setLastY(current);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  return (
    <div>
      {/* HEADER */}
      <div
        className="
          fixed left-0 right-0 z-40
          bg-[var(--background)]
          border-b border-[var(--border)]
          transition-transform duration-300
        "
        style={{
          top: "50px",
          transform: visible ? "translateY(0)" : "translateY(-102px)",
        }}
      >
        <div className="max-w-2xl mx-auto flex h-[52px] items-center">
          
          {/* Fan Feed */}
          <Link
            href="/fanhub"
            className="flex-1 flex items-center justify-center"
          >
            <span
              className={`
                px-4 py-2 rounded-full text-sm transition
                ${
                  isFeed
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }
              `}
            >
              Fan Feed
            </span>
          </Link>

          {/* Pick */}
          <Link
            href="/fanhub/predict"
            className="flex-1 flex items-center justify-center"
          >
            <span
              className={`
                px-4 py-2 rounded-full text-sm transition
                ${
                  isPredict
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }
              `}
            >
              Pick
            </span>
          </Link>

        </div>
      </div>

      {/* CAROUSEL */}
      <div className="pt-[10px] px-3">
        <TodayMatchCarouselLoader />
      </div>

      {/* CONTENT */}
      <div className="w-full px-3 mt-2">{children}</div>
    </div>
  );
}
