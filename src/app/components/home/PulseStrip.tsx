// src/app/components/home/PulseStrip.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type LiveRoom = {
  id: string;
  participants?: number;
  status?: "Scheduled" | "LIVE" | "END";
};

export default function PulseStrip() {
  const [rooms, setRooms] = useState<LiveRoom[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/live/rooms/football", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setRooms(data.rooms ?? []);
      } catch {
        // fail silently
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const pulse = useMemo(() => {
    const active = rooms.filter((r) => r.status !== "END");
    const live = active.filter((r) => r.status === "LIVE");
    const people = active.reduce((sum, r) => sum + (r.participants ?? 0), 0);

    if (live.length > 0) {
      return {
        label: `Live now · ${people} ${
          people === 1 ? "person" : "people"
        } around local matches`,
        tone: "live" as const,
      };
    }

    if (active.length > 0) {
      return {
        label: `Today · People are already circling a few matches`,
        tone: "today" as const,
      };
    }

    return {
      label: `Local matches happen quietly — explore what’s near you`,
      tone: "quiet" as const,
    };
  }, [rooms]);

  return (
    <section className="px-4">
      <Link href="/live" className="block">
        <div
          className="
            max-w-3xl mx-auto
            rounded-full
            border border-border/60
            bg-background/60
            backdrop-blur
            shadow-sm shadow-black/5
            px-4 py-2
            flex items-center gap-2
          "
        >
          {pulse.tone === "live" ? (
            <motion.span
              className="text-xs font-semibold text-red-600 shrink-0"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              ●
            </motion.span>
          ) : (
            <span className="text-xs text-gray-400 shrink-0">●</span>
          )}

          <p className="text-xs text-gray-700 dark:text-gray-200 truncate">
            {pulse.label}
          </p>
        </div>
      </Link>
    </section>
  );
}
