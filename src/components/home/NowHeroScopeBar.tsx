// src/app/components/home/NowHeroScopeBar.tsx

"use client";

import type { TimeScope } from "@/lib/nowDashboard";

export default function NowHeroScopeBar({
  scope,
  onScopeChange,
}: {
  scope: TimeScope;
  onScopeChange: (s: TimeScope) => void;
}) {
  return (
    <div
      className="
        inline-flex items-center
        rounded-full
        bg-background/60
        ring-1 ring-border/40
        p-1
      "
    >
      {(["today", "tomorrow", "weekend", "week"] as TimeScope[]).map((s) => (
        <button
          key={s}
          onClick={() => onScopeChange(s)}
          className={[
            "px-2.5 py-1.5 text-[12px] font-semibold rounded-full transition",
            scope === s
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground",
          ].join(" ")}
        >
          {s === "today" ? "Today" :
           s === "tomorrow" ? "Tomorrow" :
           s === "weekend" ? "Weekend" : "Week"}
        </button>
      ))}
    </div>
  );
}
