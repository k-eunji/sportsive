// src/lib/events/lifecycle.ts

export function isEventActiveInWindow(
  event: {
    kind?: string;
    date: string;
    startDate?: string;
    endDate?: string;
  },
  windowStart: Date,
  windowEnd: Date
): boolean {
  // ✅ SESSION EVENT (darts / tournaments)
  if (event.kind === "session" && event.startDate) {
    let start = new Date(event.startDate);
    let end = new Date(event.endDate ?? event.startDate);

    // 날짜만 있으면 하루 전체
    if (event.startDate.length === 10) {
      start.setHours(0, 0, 0, 0);
    }
    if ((event.endDate ?? event.startDate).length === 10) {
      end.setHours(23, 59, 59, 999);
    }

    return end >= windowStart && start <= windowEnd;
  }

  // MATCH / POINT EVENT
  const at = new Date(event.date);
  return at >= windowStart && at <= windowEnd;
}
