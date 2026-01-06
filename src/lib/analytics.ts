//src/lib/analytics.ts

type EventName =
  | "home_loaded"
  | "surprise_clicked"
  | "match_discovered"
  | "daily_discovery_completed";

export function logEvent(name: EventName) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[analytics] ${name}`);
  }

  // 나중에 여기만 바꾸면 GA / PostHog / 자체 API 연결 가능
  // fetch("/api/log", { method: "POST", body: JSON.stringify({ name }) })
}
