// src/app/teams/[teamId]/TeamLayout.client.tsx

"use client";

import { useEffect, useState, ReactNode, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";

import TeamOverview from "./components/TeamOverview.refactored";
import TeamMeetups from "./components/TeamMeetups";
import TeamMatches from "./components/TeamMatches";
import TeamQnA from "./components/TeamQnA";
import FanTalk from "./components/fantalk/FanTalk";

interface TeamLayoutClientProps {
  children: ReactNode;
  teamId: string;
}

export default function TeamLayoutClient({ children, teamId }: TeamLayoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") ?? "overview";

  const [visible, setVisible] = useState(true);
  const lastY = useRef(0); // 🔥 변경됨

  useEffect(() => {
    function handleScroll() {
      const current = window.scrollY;

      // visible만 상태 업데이트 → UI 변경
      setVisible(!(current > lastY.current && current > 60));

      // lastY는 ref → 재렌더 없음!
      lastY.current = current;
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // 🔥 lastY 제거

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "talk", label: "Fan Talk" },
    { key: "qna", label: "QnA" },
    { key: "meetups", label: "Meetups" },
    { key: "matches", label: "Matches" },
  ];

  const onTabChange = (key: string) => {
    router.push(`/teams/${teamId}?tab=${key}`);
  };

  return (
    <div>
      <Header showLogo disableHide />

      <div
        className="
          fixed left-0 right-0 z-40
          bg-[var(--background)]
          border-b border-[var(--border)]
          transition-transform duration-300
        "
        style={{
          top: "48px",
          transform: visible ? "translateY(0)" : "translateY(-102px)",
        }}
      >
        <div className="max-w-2xl mx-auto flex h-[44px] items-center gap-3 px-3 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`
                px-4 py-2 rounded-full text-sm whitespace-nowrap
                ${
                  tab === t.key
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }
              `}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full px-3 pt-[24px] max-w-4xl mx-auto">
        {children}

        <div className="mt-6 min-h-[400px]">
          {tab === "overview" && (
            <TeamOverview teamId={teamId} region="" sport="football" />
          )}

          {tab === "talk" && <FanTalk teamId={teamId} />}
          {tab === "qna" && <TeamQnA teamId={teamId} />}
          {tab === "meetups" && <TeamMeetups teamId={teamId} />}
          {tab === "matches" && <TeamMatches teamId={teamId} />}
        </div>
      </div>
    </div>
  );
}
