// src/app/components/PlatformActivity.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function logPlatformVisit() {
  try {
    const key = "sportsive_platform_visits";
    const raw = localStorage.getItem(key);
    const n = raw ? Number(raw) : 0;
    localStorage.setItem(key, String(n + 1));
  } catch {}
}

function getPlatformVisitLine() {
  try {
    const raw = localStorage.getItem("sportsive_platform_visits");
    const n = raw ? Number(raw) : 0;

    if (n <= 1) return "You’re early here.";
    if (n <= 3) return "A few people have checked this recently.";
    return "People have been passing through here today.";
  } catch {
    return null;
  }
}

export default function PlatformActivity() {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    logPlatformVisit();
    setLine(getPlatformVisitLine());
  }, []);

  return (
    <motion.section
      className="px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="
          w-full md:max-w-3xl md:mx-auto
          rounded-2xl
          border border-border/60
          bg-background/60
          backdrop-blur
          shadow-sm shadow-black/5
          px-5 py-4
          text-sm
          text-gray-600 dark:text-gray-300
          flex flex-col md:flex-row md:items-center md:justify-between
          gap-2
        "
      >
        <p className="font-medium text-gray-900 dark:text-gray-100">
          The map keeps moving.
        </p>
        <p className="text-xs md:text-sm text-gray-500">
          Matches shift daily · Explore first · Join only if you feel it
        </p>

        {line && (
          <p className="text-xs text-gray-500">
            {line}
          </p>
        )}
      </div>
    </motion.section>
  );
}
