//src/components/ui/BottomSheet.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRef } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: string;
  title?: string;
}

export default function BottomSheet({
  open,
  onClose,
  children,
  height = "78vh",
  title = "Comments",
}: BottomSheetProps) {
  const sheetRef = useRef(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dimmed Background */}
          <motion.div
            className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[95]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 rounded-t-3xl shadow-lg z-[100] flex flex-col"
            style={{ height }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 mb-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-24">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
