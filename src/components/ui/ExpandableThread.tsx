// src/components/ui/ExpandableThread.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function ExpandableThread({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden mt-3 border-l pl-4"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
