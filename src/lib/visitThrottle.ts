// src/lib/visitThrottle.ts
const KEY = "sportsive_last_visit_log_ts";
const GAP = 10 * 60 * 1000; // 10분

export function shouldLogVisit() {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  const last = Number(localStorage.getItem(KEY) || 0);

  if (now - last < GAP) return false;

  localStorage.setItem(KEY, String(now));
  return true;
}
