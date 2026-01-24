// src/lib/analytics.ts

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

/**
 * 개발자(본인) 여부
 * - 로컬 / dev 환경: 자동 true
 * - 배포 환경: NEXT_PUBLIC_IS_DEV=true 인 브라우저만 true
 */
const isDevUser =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_IS_DEV === "true";

export function logEvent(
  name: EventName | string,
  props?: EventProps
) {
  const finalProps: EventProps = {
    ...(props ?? {}),
    ...(isDevUser ? { is_dev: "true" } : {}),
  };

  if (process.env.NODE_ENV !== "production") {
    if (Object.keys(finalProps).length > 0) {
      console.log(`[analytics] ${name}`, finalProps);
    } else {
      console.log(`[analytics] ${name}`);
    }
  }

  // 미래:
  // GA4:
  // logEvent(analytics, name, finalProps)

  // PostHog:
  // posthog.capture(name, finalProps)
}
