//src/app/components/home/activity.ts

type Activity =
  | { type: "discover"; at: number }
  | { type: "stamp"; at: number };

const STORAGE_KEY = "sportsive_activity_log_v1";

export function logActivity(a: Activity) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: Activity[] = raw ? JSON.parse(raw) : [];
    arr.push(a);

    // keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(-50)));
  } catch {}
}

export function getRecentActivity(): Activity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const arr: Activity[] = JSON.parse(raw);
    return arr[arr.length - 1] ?? null;
  } catch {
    return null;
  }
}

export function timeAgo(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m === 1) return "1 minute ago";
  if (m < 60) return `${m} minutes ago`;
  const h = Math.floor(m / 60);
  return `${h} hour${h > 1 ? "s" : ""} ago`;
}
