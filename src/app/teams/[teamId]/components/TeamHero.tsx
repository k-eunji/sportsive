// src/app/teams/[teamId]/components/TeamHero.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function TeamOverview({ team, teamId }: any) {
  const [isLive, setIsLive] = useState(false);
  const [nearbyFans, setNearbyFans] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [liveRes, fansRes] = await Promise.all([
          fetch(`/api/teams/${teamId}/live`, { cache: "no-store" }),
          fetch(`/api/teams/${teamId}/fans/count`, { cache: "no-store" }),
        ]);
        const liveData = await liveRes.json();
        const fansData = await fansRes.json();
        setIsLive(liveData.rooms?.length > 0);
        setNearbyFans(fansData.count ?? 0);
      } catch {}
    })();
  }, [teamId]);

  return (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <img
        src={team.logo}
        alt={team.name}
        className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-gray-200 object-cover"
      />
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-4xl font-extrabold flex items-center gap-2 justify-center md:justify-start">
          {team.name}
          {isLive && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </h1>
        <p className="text-gray-500 flex items-center justify-center md:justify-start gap-1">
          <FaMapMarkerAlt /> {team.city ?? "Unknown City"} · {team.region ?? "Regional Club"}
        </p>
        <p className="text-sm text-gray-600 mt-2">Nearby fans: {nearbyFans}</p>
      </div>
    </motion.div>
  );
}
