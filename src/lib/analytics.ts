//src/lib/analytics.ts

export type EventName =
  | "home_loaded"
  | "surprise_clicked"
  | "match_discovered"
  | "daily_discovery_completed"
  | "map_opened"
  | "map_closed"
  | "stamp_earned"
  | "details_opened"
  | "live_opened";

export type EventProps = Record<string, string>;

export function logEvent(
  name: EventName | string, // ⭐ 여기만 바뀜
  props?: EventProps
) {
  if (process.env.NODE_ENV !== "production") {
    if (props && Object.keys(props).length > 0) {
      console.log(`[analytics] ${name}`, props);
    } else {
      console.log(`[analytics] ${name}`);
    }
  }

  // 미래:
  // GA4: logEvent(name, props)
  // PostHog: posthog.capture(name, props)
}
