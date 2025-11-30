// src/app/live/layout.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import TodayMatchCarouselLoader from "@/app/fanhub/components/TodayMatchCarouselLoader";

const SPORTS_TABS = [
  { key: "all", label: "All" },
  { key: "football", label: "Football" },
  { key: "rugby", label: "Rugby" },
  { key: "cricket", label: "Cricket" },
  { key: "tennis", label: "Tennis" },
  { key: "golf", label: "Golf" },
  { key: "f1", label: "F1" },
  { key: "horseracing", label: "Horse Racing" },
  { key: "other", label: "Other" },
];

export default function LiveHubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/");

  const currentTab = segments[2] ? segments[2] : "all";
  const isLiveRoom = segments.length === 4;  // /live/[sport]/[liveId]

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
      {/* ⭐ 라이브 상세 페이지에서는 상단 탭 완전 숨김 */}
      {!isLiveRoom && (
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
          <div className="max-w-2xl mx-auto flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
            {SPORTS_TABS.map((tab) => {
              const active = currentTab === tab.key;

              return (
                <Link
                  key={tab.key}
                  href={tab.key === "all" ? "/live" : `/live/${tab.key}`}
                  className={`
                    px-4 py-2 rounded-full text-sm whitespace-nowrap transition
                    ${
                      active
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }
                  `}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ⭐ 캐러셀 역시 live room에서는 숨김 */}
      {!isLiveRoom && (
        <div className="pt-[10px] px-3">
          <TodayMatchCarouselLoader sport={currentTab} />

        </div>
      )}

      {/* CONTENT */}
      <div className="w-full px-3 mt-[5px]">{children}</div>
    </div>
  );
}
