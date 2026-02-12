//src/lib/events/getAllEventsRaw.ts

import { getAllEvents } from "./getAllEvents";

export async function getAllEventsRaw(window: string = "7d") {
  const { events } = await getAllEvents("180d");

  if (window === "180d") {
    // ✅ 180일 전체 그대로 반환 (날짜 페이지용)
    return events;
  }

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
