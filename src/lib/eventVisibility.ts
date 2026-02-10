//src/lib/eventVisibility.ts

import { getEventTimeState } from "@/lib/eventTime";
import { resolveEventBehavior } from "@/lib/resolveEventBehavior";

export type MapVisibility =
  | "ACTIVE"
  | "ENDED_TODAY"
  | "HIDDEN";

export function getMapVisibility(e: any, now = new Date()): MapVisibility {
  const state = getEventTimeState(e, now);

  if (state === "LIVE" || state === "SOON" || state === "UPCOMING") {
    return "ACTIVE";
  }

  // ⬇️ 여기서부터가 지도 전용 로직
  const raw = e.date ?? e.startDate;
  const start = new Date(raw);
  if (isNaN(start.getTime())) return "HIDDEN";

  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const nowDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
    
  const behavior = resolveEventBehavior(e);

  // day_span 이벤트는 하루 종료로 dim 처리 금지
  if (behavior.timeModel === "day_span") {
    return "ACTIVE";
  }

  return "HIDDEN";
}
