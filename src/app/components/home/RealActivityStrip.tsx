//src/app/components/home/RealActivityStrip.tsx

"use client";

import { useEffect, useState } from "react";
import { getRecentActivity, timeAgo } from "./activity";

export default function RealActivityStrip() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const a = getRecentActivity();
    if (!a) return;

    if (a.type === "discover") {
      setMsg(`Someone explored a match nearby ${timeAgo(a.at)}`);
    }
    if (a.type === "stamp") {
      setMsg(`A local venue was discovered ${timeAgo(a.at)}`);
    }
  }, []);

  if (!msg) return null;

  return (
    <section className="px-6">
      <div className="md:max-w-3xl mx-auto">
        <div
          className="
            rounded-full border border-border/60
            bg-background/60 backdrop-blur
            shadow-sm shadow-black/5
            px-4 py-2
            text-xs text-gray-700
            flex items-center gap-2
          "
        >
          <span className="text-red-600 font-semibold">●</span>
          <span className="truncate">{msg}</span>
        </div>
      </div>
    </section>
  );
}
