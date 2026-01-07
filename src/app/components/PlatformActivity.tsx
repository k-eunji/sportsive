// src/app/components/PlatformActivity.tsx
"use client";

import { motion } from "framer-motion";

export default function PlatformActivity() {
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
      </div>
    </motion.section>
  );
}
