// src/app/teams/[teamId]/components/TeamMatches.tsx

"use client";

import { useTeamMatches } from "@/hooks/useTeamMatches";
import MatchCard from "@/app/teams/components/MatchCard";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseDateSafe } from "@/utils/parseDate";

export default function TeamMatches({ teamId }: { teamId: string }) {
  const { matches, loading, error } = useTeamMatches(teamId);
  const sliderRef = useRef<HTMLDivElement>(null);


  const now = new Date();

  const sorted = matches?.length
    ? [...matches].sort(
        (a, b) =>
          parseDateSafe(a.date).getTime() -
          parseDateSafe(b.date).getTime()
      )
    : [];

  const closestIndex =
    sorted.length > 0
      ? sorted.reduce((bestIdx, match, idx) => {
          const diff = Math.abs(
            parseDateSafe(match.date).getTime() - now.getTime()
          );
          const bestDiff = Math.abs(
            parseDateSafe(sorted[bestIdx].date).getTime() - now.getTime()
          );
          return diff < bestDiff ? idx : bestIdx;
        }, 0)
      : 0;

  /** Center scroll only when matches exist */
  useEffect(() => {
    if (!sliderRef.current || sorted.length === 0) return;

    setTimeout(() => {
      const container = sliderRef.current as HTMLDivElement;

      // children은 HTMLCollection → HTMLElement로 캐스팅
      const target = container.children[closestIndex] as HTMLElement | null;
      if (!target) return;

      const offset =
        target.offsetLeft -
        container.clientWidth / 2 +
        target.clientWidth / 2;

      container.scrollTo({
        left: offset,
        behavior: "smooth",
      });
    }, 0);
  }, [closestIndex, sorted.length]);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;

    const card = sliderRef.current.children[0] as HTMLElement | null;
    if (!card) return;

    const style = window.getComputedStyle(card);
    const marginRight = parseInt(style.marginRight);
    const marginLeft = parseInt(style.marginLeft);

    const cardWidth = card.clientWidth + marginLeft + marginRight;

    sliderRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  /** ---------- RENDERING ---------- */

  if (loading) {
    return (
      <p className="text-center text-gray-500 animate-pulse mt-12">
        Loading matches...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 mt-12">
        Failed to load matches.
      </p>
    );
  }

  if (!sorted.length) {
    return (
      <p className="text-center text-gray-400 mt-12">
        No matches available.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Matches</h2>
        <Link
          href={`/teams/${teamId}/matches/all`}
          className="text-sm text-blue-600 hover:text-blue-700 underline underline-offset-4"
        >
          View full schedule →
        </Link>
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Arrow Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2
                     bg-white dark:bg-gray-800 shadow-md rounded-full 
                     p-2 z-10"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2
                     bg-white dark:bg-gray-800 shadow-md rounded-full 
                     p-2 z-10"
        >
          <ChevronRight size={20} />
        </button>

        {/* Slidable row */}
        <div
          ref={sliderRef}
          className="
            flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3
            scrollbar-hide
            justify-center
          "
        >
          {sorted.map((match, idx) => {
            const isPast = parseDateSafe(match.date) < now;

            return (
              <div
                key={match.id}
                className="
                  snap-center flex-shrink-0 w-60 sm:w-72 
                  transition-all duration-300
                "
              >
                <MatchCard
                  match={match}
                  isPast={isPast}
                  isCenter={idx === closestIndex}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
