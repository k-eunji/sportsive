//src/lib/events/getAllEventsRaw.ts

import { getAllEvents } from "./getAllEvents";

export async function getAllEventsRaw(window: string = "7d") {
  // 180d는 lifecycle 필터 안 걸림
  const { events } = await getAllEvents("180d");

  const now = new Date();
  const windowEnd = new Date(now);

  if (window === "today") {
    windowEnd.setHours(23, 59, 59, 999);
  } else if (window === "7d") {
    windowEnd.setDate(windowEnd.getDate() + 7);
  }

  return events.filter((e: any) => {
    const date = new Date(e.date ?? e.utcDate ?? e.startDate);
    return date <= windowEnd;
  });
}
