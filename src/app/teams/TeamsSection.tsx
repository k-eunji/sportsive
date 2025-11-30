// src/app/teams/TeamsSection.tsx
"use client";

import { useTeams } from "./hooks/useTeams";
import TeamList from "./components/TeamList";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TeamsSection() {
  const { teams, isLoading, isError } = useTeams();

  if (isLoading)
    return <p className="text-center text-muted-foreground mt-12 animate-pulse">Loading teams...</p>;
  if (isError)
    return <p className="text-center text-red-500 mt-12">Error loading teams.</p>;

  return (
    <section className="relative mt-28 text-center" id="teams">
      {/* 🌈 subtle background accent */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-transparent to-transparent dark:from-blue-950/30" />

      {/* 🏳️ Title */}
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold mb-6 
                   bg-gradient-to-r from-blue-600 to-indigo-600 
                   bg-clip-text text-transparent drop-shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        🏳️ Team Fanzones
      </motion.h2>

      <motion.p
        className="text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        Find your club’s fanzone — fixtures, meetups, and fan feed in one place.
      </motion.p>

      {/* 🇬🇧 National Team Fanzone (고정) */}
      <motion.div
        className="flex justify-center mb-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        <Link
          href="/teams/england"
          className="flex flex-col items-center bg-gradient-to-r from-red-500 via-white to-blue-500 rounded-3xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-200 dark:border-gray-700"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg"
            alt="England Flag"
            className="w-16 h-10 object-cover rounded-md border border-gray-300"
          />
          <p className="mt-2 font-semibold text-gray-800 dark:text-gray-100">🇬🇧 England Fanzone</p>
          <span className="text-xs text-gray-500 dark:text-gray-400">World Cup 2026 Supporters Hub</span>
        </Link>
      </motion.div>

      {/* 📋 Team list container */}
      <motion.div
        className="max-w-5xl mx-auto px-4 rounded-3xl p-6 md:p-10 border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/50 shadow-lg hover:shadow-xl transition-all duration-300"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <TeamList teams={teams} />
      </motion.div>
    </section>
  );
}
