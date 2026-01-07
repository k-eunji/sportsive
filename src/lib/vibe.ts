//src/lib/vibe.ts

import type { Event } from "@/types";

export type Vibe = {
  label: string;
  tone: "live" | "good" | "calm" | "unknown";
  emoji?: string;
};

function isWeekend(d: Date) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function getVibe(e: any): Vibe {
  const dt = new Date(e.date ?? e.utcDate ?? Date.now());
  const hour = dt.getHours();
  const status = (e.status ?? "").toUpperCase();

  if (status === "LIVE") return { label: "Live now", tone: "live", emoji: "●" };

  // Heuristics (cheap but useful)
  if (isWeekend(dt) && hour >= 16) return { label: "Good atmosphere", tone: "good", emoji: "✨" };
  if (hour >= 18 && hour <= 21) return { label: "After-work friendly", tone: "good", emoji: "🌙" };
  if (hour >= 11 && hour <= 15) return { label: "Easy daytime watch", tone: "calm", emoji: "☀️" };

  return { label: "Worth a look", tone: "unknown", emoji: "👀" };
}

export function vibeClass(tone: Vibe["tone"]) {
  switch (tone) {
    case "live":
      return "text-red-600 bg-red-50 border-red-200";
    case "good":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "calm":
      return "text-slate-700 bg-slate-50 border-slate-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
}
