// src/components/layout/IntroLogo.tsx

'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroLogo({ onFinish }: { onFinish?: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onFinish?.();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          {/* 🌈 Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black" />

          {/* 🌈 Animated logo */}
          <motion.h1
            layoutId="intro-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 1, y: -100 }}
            exit={{
              scale: 0.6,
              y: -240,
              opacity: 0,
              transition: { duration: 0.8, ease: 'easeInOut' },
            }}
            className="font-extrabold text-6xl md:text-8xl tracking-tight text-black dark:text-white"
          >
            <span className="text-black dark:text-white">sp</span>
            <span
              className="inline-block bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 to-blue-500 text-transparent bg-clip-text animate-pulse"
            >
              o
            </span>
            <span className="text-black dark:text-white">rtsive</span>
          </motion.h1>
        </div>
      )}
    </AnimatePresence>
  );
}
