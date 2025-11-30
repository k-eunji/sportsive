//src/app/teams/[teamId]/mom-vote/components/TodayMatchCard.tsx

"use client";

import { useState, useEffect } from "react";

export default function TodayMatchCard({
  todayMatch,
  nextMatch,
  children,
  momMod, 
  onStateChange,   // ⭐ 추가
}: {
  todayMatch: any;
  nextMatch: any;
  momMod?: any; 
  children?: React.ReactNode;
  onStateChange?: (state: {
    isStarted: boolean;
    isClosed: boolean;
    endTime: number;
    remaining: number;
  }) => void;       // ⭐ 타입 추가
}) {

  const formatUKDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatUKTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // 🟥 오늘 경기 없음 → 다음 경기 표시
  if (!todayMatch && nextMatch) {
    return (
      <div className="rounded-xl bg-white border shadow-sm p-5 text-center">
        <p className="text-sm font-semibold text-gray-700 mb-1">
          MOM Vote (Man of the Match)
        </p>

        <p className="text-xs text-gray-500 mb-3">
          No match today — voting opens on matchday.
        </p>

        <p className="text-sm text-gray-700">
          <span className="font-semibold">Next Match:</span>{" "}
          {formatUKDate(nextMatch.date)}
        </p>

        <p className="text-sm font-medium">
          vs {nextMatch.opponent ?? "Unknown"}
        </p>
      </div>
    );
  }

  if (!todayMatch) return null;

  const kickoff = new Date(todayMatch.kickoff || todayMatch.date);
  const isStarted = Date.now() >= kickoff.getTime();

  // 🔥 투표 종료 시간 = kickoff + 24시간
  const endTime = new Date(kickoff.getTime() + 24 * 60 * 60 * 1000);
  const totalDuration = endTime.getTime() - kickoff.getTime();

  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isStarted) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Closed");
        setProgress(0);
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

      const pct = Math.max(0, Math.min(100, (diff / totalDuration) * 100));
      setProgress(pct);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted]);

  const formatHM = (d: Date) =>
    d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  // 🔥 남은 시간 색상
  const getTimeLeftColor = () => {
    if (timeLeft === "Closed") return "text-red-600 font-bold";

    const [h] = timeLeft.split("h").map((v) => parseInt(v.trim()));

    if (h <= 1) return "text-red-600 font-bold"; // 1시간 이하
    if (h <= 3) return "text-orange-500 font-semibold"; // 3시간 이하

    return "text-gray-600"; // 기본
  };

  useEffect(() => {
    if (!isStarted) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Closed");
        setProgress(0);
        
        // ⭐ 여기에서 TeamFanZone으로 상태 전달
        onStateChange?.({
          isStarted: true,
          isClosed: true,
          endTime: endTime.getTime(),
          remaining: 0,
        });

        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

      const pct = Math.max(0, Math.min(100, (diff / totalDuration) * 100));
      setProgress(pct);

      // ⭐ 여기에서 TeamFanZone으로 상태 전달
      onStateChange?.({
        isStarted: true,
        isClosed: false,
        endTime: endTime.getTime(),
        remaining: diff,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted]);


  return (
    <div className="mb-4">
      <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">
        MOM Vote
      </p>

      <p className="text-xs text-gray-500">
        {formatUKDate(todayMatch.kickoff || todayMatch.date)}
      </p>

      <p className="text-xl font-extrabold text-gray-900 mt-1 leading-tight">
        vs {todayMatch.opponent || momMod?.data?.opponent || "Unknown"}
      </p>

      {/* BEFORE kickoff */}
      {!isStarted ? (
        <p className="text-blue-600 text-sm mb-4">
          Voting opens at kick-off ({formatUKTime(todayMatch.kickoff || todayMatch.date)})
        </p>
      ) : (
        <div className="mb-4">
          {/* OPEN 상태 */}
          {/* STATUS CHIPS */}
          <div className="flex items-center gap-2 mb-3">

            {/* OPEN / UPCOMING */}
            <span
              className={`
                px-2 py-[3px] rounded-full text-[11px] font-semibold
                ${isStarted ? "bg-green-600 text-white" : "bg-gray-300 text-gray-700"}
              `}
            >
              {isStarted ? "OPEN" : "UPCOMING"}
            </span>

            {/* CLOSE TIME */}
            {isStarted && (
              <span className="px-2 py-[3px] bg-gray-100 text-gray-700 text-[11px] rounded-full">
                Closes {formatHM(endTime)}
              </span>
            )}

            {/* TIME LEFT */}
            {isStarted && (
              <span
                className={`
                  px-2 py-[3px] text-[11px] rounded-full font-semibold
                  ${timeLeft === "Closed"
                    ? "bg-red-600 text-white"
                    : "bg-orange-100 text-orange-700"}
                `}
              >
                {timeLeft === "Closed" ? "CLOSED" : `${timeLeft} left`}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                progress <= 10 ? "bg-red-500" : progress <= 30 ? "bg-orange-400" : "bg-green-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4">{children}</div>
    </div>
  );
}

