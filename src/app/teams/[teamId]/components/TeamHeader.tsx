// src/app/teams/[teamId]/components/TeamHeader.tsx

"use client";

import { motion } from "framer-motion";
import {
  FaLocationDot,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import Link from "next/link";

// 🔥 영국식 날짜 포맷 (SSR & CSR identical)
function formatUK(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export default function TeamHeader({
  team,
  teamId,
  isLive,
  nearbyFans,
  nextMatch,
}: any) {
  return (
    <motion.header
      initial={false} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="
        w-full mb-6
        pt-6 pb-6 px-4
        border-b border-[var(--border)]/70
        bg-[var(--background)]
      "
    >
      <div
        className="
          max-w-4xl mx-auto
          flex flex-col sm:flex-row
          sm:items-center
          gap-6
        "
      >
        {/* LOGO */}
        <img
          src={team.logo}
          alt={team.name}
          className="w-20 h-20 rounded-2xl object-contain bg-white shrink-0 mx-auto sm:mx-0"
        />

        {/* INFO */}
        <div className="flex-1 space-y-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h1 className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              {team.name}
            </h1>

            {isLive && (
              <span className="text-[10px] font-semibold bg-red-600 text-white px-2 py-[2px] rounded-full animate-pulse">
                LIVE
              </span>
            )}
          </div>

          <p className="flex items-center justify-center sm:justify-start gap-1 text-[13px] text-gray-500 dark:text-gray-400">
            <FaLocationDot className="opacity-70" />
            {team.city}, {team.region}
          </p>

          {nextMatch && (
            <p className="text-[13px] text-gray-600 dark:text-gray-300">
              Next:
              <span className="font-medium"> {nextMatch.homeTeam}</span>
              {" vs "}
              <span className="font-medium">{nextMatch.awayTeam}</span>
              {" · "}
              {formatUK(nextMatch.date)} {/* 🔥 hydration-safe UK date */}
            </p>
          )}

          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            Nearby Fans: {nearbyFans}
          </p>

          <div className="flex justify-center sm:justify-start gap-3 pt-1.5 text-[18px] text-gray-500 dark:text-gray-400">
            {team.instagram && <a href={team.instagram}><FaInstagram /></a>}
            {team.x && <a href={team.x}><FaXTwitter /></a>}
            {team.youtube && <a href={team.youtube}><FaYoutube /></a>}
            {team.homepageUrl && (
              <Link
                href={team.homepageUrl}
                className="text-[13px] hover:text-gray-900 dark:hover:text-white transition"
              >
                🌐 Official
              </Link>
            )}
          </div>
        </div>

        {/* CTA BUTTONS */}
        <div
          className="
            flex gap-3 sm:flex-col 
            mt-4 sm:mt-0
            w-full sm:w-auto
            justify-center sm:justify-end
          "
        >
          <button className="
            px-5 py-2 rounded-xl text-sm font-semibold
            bg-gray-900 text-white hover:bg-black transition w-full sm:w-auto
          ">
            Join
          </button>

          <Link
            href={`/meetups/create?team=${teamId}`}
            className="
              px-5 py-2 rounded-xl text-sm font-semibold text-center
              bg-gray-100 dark:bg-neutral-800
              text-gray-800 dark:text-white
              border border-gray-300 dark:border-neutral-700
              hover:bg-gray-200 dark:hover:bg-neutral-700 transition
              w-full sm:w-auto
            "
          >
            Meetup
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
