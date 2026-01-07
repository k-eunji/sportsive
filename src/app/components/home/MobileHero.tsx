//src/app/components/home/MobileHero.tsx

"use client";

import SoftButton from "@/components/ui/SoftButton";
import { motion } from "framer-motion";

export default function MobileHero({ onSurprise }: { onSurprise: () => void }) {
  return (
    <section className="px-6 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center space-y-3"
      >
        <p className="text-[11px] uppercase tracking-widest text-red-600 font-medium">
          Local sport is happening
        </p>

        <h1 className="text-xl font-semibold tracking-tight">
          Something is happening near you
        </h1>
        <p className="text-xs text-muted-foreground">
          Right now · Real matches · Quietly
        </p>

        <div className="pt-1 flex justify-center">
          <SoftButton onClick={onSurprise} className="px-6 py-2.5">
            🎲 Surprise near me
          </SoftButton>
        </div>
      </motion.div>
    </section>
  );
}
