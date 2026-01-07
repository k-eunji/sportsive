//src/app/components/home/First15Overlay.tsx

"use client";

import { useEffect, useState } from "react";

const KEY = "sportsive_first15_seen_v1";

export default function First15Overlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(KEY);
      if (!seen) setOpen(true);
    } catch {}
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Close onboarding"
        onClick={() => {
          try {
            localStorage.setItem(KEY, "1");
          } catch {}
          setOpen(false);
        }}
      />

      <div className="relative w-full md:max-w-lg mx-auto m-4 rounded-3xl border border-border/60 bg-background/80 backdrop-blur px-5 py-5 shadow-sm shadow-black/10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          How to use
        </p>

        <h3 className="mt-2 text-base font-semibold tracking-tight">
          Explore first. Decide later.
        </h3>

        <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>1) Tap <span className="font-semibold text-foreground">🎲 Surprise</span> for a random nearby match</li>
          <li>2) Or tap a match card to jump into the map</li>
          <li>3) Collect stamps — no signup needed</li>
        </ol>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="text-sm font-semibold text-blue-600 hover:underline underline-offset-4"
            onClick={() => {
              try {
                localStorage.setItem(KEY, "1");
              } catch {}
              setOpen(false);
            }}
          >
            Got it →
          </button>
        </div>
      </div>
    </div>
  );
}
