// src/app/components/WhatIsSportsiveCompact.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function WhatIsSportsiveCompact() {
  return (
    <section className="px-6 pt-6">
      <motion.div
        className="
          w-full md:max-w-3xl md:mx-auto
          rounded-2xl
          border border-border/60
          bg-background/60
          backdrop-blur
          shadow-sm shadow-black/5
          px-5 py-5
          text-center
          space-y-3
        "
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.35 }}
      >
        <h3 className="text-base font-semibold tracking-tight">
          What is Sportsive?
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Discover real sports matches based on where you are and when they happen —
          not teams, not hype.
        </p>

        <div className="pt-1">
          <Link
            href="/events"
            className="text-sm font-semibold text-blue-600 hover:underline underline-offset-4"
          >
            Open full match map →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
