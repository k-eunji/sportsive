import { getAllEvents } from "./getAllEvents";

export async function getAllEventsRaw(window: string = "7d") {

  const { events } = await getAllEvents(
    window === "all" ? "all" : "180d"
  );

  /* =========================
     ALL (완전 무제한)
  ========================= */

  if (window === "all") {
    return events;
  }

  if (window === "180d") {
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