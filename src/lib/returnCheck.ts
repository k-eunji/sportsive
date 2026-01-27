//src/lib/returnCheck.ts

const KEY = "sportsive_first_visit_ts";
const LIMIT = 24 * 60 * 60 * 1000; // 24h

export function isReturn24h(): boolean {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  const first = localStorage.getItem(KEY);

  if (!first) {
    localStorage.setItem(KEY, String(now));
    return false; // 첫 방문
  }

  return now - Number(first) <= LIMIT;
}
