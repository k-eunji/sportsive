//src/app/components/home/StampsBar.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { clearStamps, listStamps } from "./stamps";

export default function StampsBar({ discoveredToday }: { discoveredToday: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ key: string; label: string; lastSeen: number }[]>([]);

  useEffect(() => {
    setItems(listStamps());
  }, [open]);

  const total = items.length;

  const subtitle = useMemo(() => {
    if (total === 0) return "Start collecting local venues";
    if (total === 1) return "1 venue collected";
    return `${total} venues collected`;
  }, [total]);

  return (
    <section className="px-6">
      <div className="md:max-w-3xl mx-auto">
        <button
          onClick={() => setOpen(true)}
          className="
            w-full text-left
            rounded-2xl border border-border/60
            bg-background/60 backdrop-blur
            shadow-sm shadow-black/5
            px-4 py-3
          "
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Your local stamps</p>
              <p className="text-xs text-gray-500 truncate">
                {subtitle} · Today {discoveredToday}/3
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600 shrink-0">Open →</span>
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close stamps"
          />
          <div
            className="
              absolute left-0 right-0 bottom-0
              pb-[env(safe-area-inset-bottom)]
              bg-white dark:bg-black
              rounded-t-3xl border-t
              max-h-[78vh]
              overflow-hidden
            "
          >
            <div className="px-5 pt-4 pb-3 border-b">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">Stamps</p>
                  <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
                <button
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="px-5 py-4 overflow-auto max-h-[62vh]">
              {items.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Tap matches or pins to collect venues. No signup needed.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <span
                      key={s.key}
                      className="text-xs px-3 py-1.5 rounded-full border bg-gray-50 dark:bg-white/5"
                    >
                      📍 {s.label}
                    </span>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <div className="pt-5">
                  <button
                    onClick={() => {
                      clearStamps();
                      setItems([]);
                    }}
                    className="text-sm font-semibold text-red-600 hover:underline underline-offset-4"
                  >
                    Clear stamps
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
