/// src/app/components/HeroCommunity.tsx

"use client";

import { motion } from "framer-motion";
import { Users, MapPin, Trophy, HeartHandshake, MessageCircle } from "lucide-react";
import EventMap from "@/app/events/components/EventMap";
import type { Event } from "@/types";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function HeroCommunity({ events }: { events: Event[] }) {
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await res.json();
        const city =
          data.city || data.locality || data.principalSubdivision || data.countryName;
        setUserRegion(city);
      } catch (err) {
        console.error(err);
      }
    });
  }, []);

  const totalEvents = events.length;
  const liveCount = useMemo(
    () =>
      events.filter((e: any) => {
        const s = String(e.status || "").toUpperCase();
        return s.includes("LIVE") || s.includes("IN_PLAY");
      }).length,
    [events]
  );
  const todayEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter(
      (e: any) => String(e.date ?? e.utcDate ?? "").slice(0, 10) === today
    ).length;
  }, [events]);

  return (
    <section className="relative flex flex-col items-center text-center py-20 overflow-hidden">

      {/* 🟢 배경 제거됨! (page.tsx가 담당) */}

      <motion.div
        className="relative z-10 max-w-3xl mx-auto space-y-6 text-gray-900 dark:text-gray-50"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[var(--primary-from)] to-[var(--primary-to)] bg-clip-text text-transparent drop-shadow-sm">
            Sportsive
          </span>
        </h1>
        <p className="text-lg md:text-xl opacity-90 leading-relaxed">
          The local <strong>sports fan community</strong> — discover matches, meet fans, and
          cheer together.
        </p>

        {userRegion && (
          <p className="text-sm opacity-80">
            📍 Showing activities near <span className="font-semibold">{userRegion}</span>
          </p>
        )}

       <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4">
        <Link
          href="/events"
          className="px-5 py-3 rounded-full bg-[var(--primary-to)] text-white font-semibold shadow hover:opacity-90 transition"
        >
          🔎 Browse Local Matches
        </Link>
        <Link
          href="/meetups"
          className="px-5 py-3 rounded-full border border-[var(--primary-to)] text-[var(--primary-to)] hover:bg-white/10 dark:hover:bg-gray-900/30 font-semibold transition"
        >
          🤝 Create a Meetup
        </Link>
        <Link
          href="/teams"
          className="px-5 py-3 rounded-full border border-[var(--primary-from)] text-[var(--primary-from)] hover:bg-white/10 dark:hover:bg-gray-900/30 font-semibold transition"
        >
          🏟️ Explore Teams
        </Link>
        <Link
          href="/community"
          className="px-5 py-3 rounded-full border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 font-semibold transition"
        >
          🗣️ Open Community Feed
        </Link>
      </div>

        
        {/* Pill Icons: “what this is” */}
        <div className="flex flex-wrap justify-center gap-6 text-gray-600 dark:text-gray-300 pt-4">
          <span className="inline-flex items-center gap-2 text-sm">
            <Trophy className="w-5 h-5 text-blue-600" /> Matches
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <HeartHandshake className="w-5 h-5 text-indigo-600" /> Meetups
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <Users className="w-5 h-5 text-purple-600" /> Fan Communities
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <MapPin className="w-5 h-5 text-emerald-600" /> Local & Nearby
          </span>
        </div>
      </motion.div>

      {/* Counters + Live Ticker */}
      <motion.div
        className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="rounded-2xl bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 px-5 py-4 shadow-sm">
          <p className="text-2xl font-extrabold">{totalEvents}</p>
          <p className="text-xs text-gray-500">Upcoming Matches</p>
        </div>
        <div className="rounded-2xl bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 px-5 py-4 shadow-sm">
          <p className="text-2xl font-extrabold">{todayEvents}</p>
          <p className="text-xs text-gray-500">Happening Today</p>
        </div>
        <div className="rounded-2xl bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 px-5 py-4 shadow-sm">
          <p className="text-2xl font-extrabold">{liveCount}</p>
          <p className="text-xs text-gray-500">Live Now</p>
        </div>
      </motion.div>

      {/* Live Ticker */}
      <motion.div
        className="mt-4 w-full max-w-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 text-red-600 px-4 py-2 text-sm justify-center">
          <MessageCircle className="w-4 h-4" />
          <span>
            Live chats are open for ongoing matches —{" "}
            <Link href="/live" className="underline underline-offset-4">join a room</Link>
            !
          </span>
        </div>
      </motion.div>

      {/* Team Chips (작은 팬 문화 느낌) */}
      <motion.div
        className="mt-6 flex flex-wrap justify-center gap-2 max-w-3xl"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        {["Arsenal", "Chelsea", "Spurs", "West Ham", "Brentford"].map((t) => (
          <Link
            key={t}
            href={`/teams?query=${encodeURIComponent(t)}`}
            className="px-3 py-1.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            #{t}Fans
          </Link>
        ))}
      </motion.div>

      {/* Map */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-white/20 mt-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <EventMap
          events={events}
          filteredEvents={filteredEvents}
          setFilteredEvents={setFilteredEvents}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          selectedCity={userRegion ?? undefined}
        />
      </motion.div>
    </section>
  );
}
