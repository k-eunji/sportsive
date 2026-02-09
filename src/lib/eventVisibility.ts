//src/lib/eventVisibility.ts

import { getEventTimeState } from "@/lib/eventTime";

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

  if (startDay.getTime() === nowDay.getTime()) {
    return "ENDED_TODAY";
  }

  return "HIDDEN";
}
