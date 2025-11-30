// src/components/layout/IntroWrapper.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroLogo from './IntroLogo';

export default function IntroWrapper({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-visible">
      {/* ✅ 이제는 fixed로 변경 — 화면 전체를 덮는 그라디언트 */}
      <div
        className="
          fixed inset-0 -z-10
          bg-gradient-to-b 
          from-blue-100/60 
          via-sky-50/60 
          to-white
          dark:from-blue-950/40
          dark:via-slate-950/60
          dark:to-[oklch(0.15_0.025_261.692)]
        "
      />

      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-background"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 1.05,
              y: -40,
              transition: { duration: 0.8, ease: 'easeInOut' },
            }}
          >
            <IntroLogo />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
