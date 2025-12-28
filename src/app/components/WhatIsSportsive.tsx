// src/app/components/WhatIsSportsive.tsx

"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function WhatIsSportsive() {
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const [stats, setStats] = useState({
    upcoming7d: 0,
    today: 0,
    live: 0,
  });

  // 📍 위치
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
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          data.countryName;
        setUserRegion(city);
      } catch (err) {
        console.error(err);
      }
    });
  }, []);

  // 📊 이벤트 요약 (핵심)
  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await fetch("/api/events/summary");
        const data = await res.json();
        setStats({
          upcoming7d: data.upcoming7d ?? 0,
          today: data.today ?? 0,
          live: data.live ?? 0,
        });
      } catch (err) {
        console.error("Failed to load event summary:", err);
      }
    }

    loadSummary();
  }, []);

  return (
    <section className="py-14 space-y-8 text-center">
      <motion.div
        className="max-w-3xl mx-auto space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-xl md:text-2xl font-medium tracking-tight">
          What is Sportsive?
        </h2>

        <p className="text-base text-gray-600 dark:text-gray-300">
          Sportsive indexes real sports matches by location and time —
          so you can discover what’s actually happening nearby.
        </p>

        {userRegion && (
          <p className="text-sm text-gray-500">
            Showing activity near{" "}
            <span className="font-medium">{userRegion}</span>
          </p>
        )}

        <div className="pt-2">
          <Link
            href="/events"
            className="text-base font-medium text-blue-600 hover:underline underline-offset-4"
          >
            Open match map →
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="max-w-3xl mx-auto text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {stats.upcoming7d} matches in the next 7 days ·{" "}
        {stats.today} today ·{" "}
        {stats.live} live now
      </motion.div>

      <motion.div
        className="max-w-3xl mx-auto pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <div className="flex items-center justify-center gap-2 text-sm text-red-600">
          <MessageCircle className="w-4 h-4" />
          <span>Live chats are open for ongoing matches.</span>
        </div>
      </motion.div>
    </section>
  );
}
