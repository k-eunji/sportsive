// src/app/components/PlatformActivity.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Event } from "@/types/event";
import type { MeetupWithEvent } from "@/types/event";

export default function PlatformActivity() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalMeetups: 0,
    activeCities: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const eventsRes = await fetch("/api/events");
        const eventsData = await eventsRes.json();
        const events: Event[] = eventsData.events ?? [];

        const meetupsRes = await fetch("/api/meetups");
        const meetupsData = await meetupsRes.json();
        const meetups: MeetupWithEvent[] = meetupsData.meetups ?? [];

        const uniqueCities = new Set(
          [
            ...events.map((e) => e.city),
            ...meetups.map((m) => m.location?.city),
          ].filter(Boolean)
        );

        setStats({
          totalEvents: events.length,
          totalMeetups: meetups.length,
          activeCities: uniqueCities.size,
        });
      } catch (err) {
        console.error("Failed to load platform stats:", err);
      }
    }

    loadStats();
  }, []);

  return (
    <motion.section
      className="mt-12 text-center text-sm text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <span>
        {stats.totalEvents} matches indexed
      </span>
      <span className="mx-2">·</span>
      <span>
        Active in {stats.activeCities} cities
      </span>
      <span className="mx-2">·</span>
      <span>
        Live & scheduled tracking
      </span>
    </motion.section>
  );
}
