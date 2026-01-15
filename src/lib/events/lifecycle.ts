//src/lib/events/lifecycle.ts

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
  // 1) 단일 시점 이벤트 (match)
  if (event.kind === "match" || !event.startDate) {
    const at = new Date(event.date);
    return at >= windowStart && at <= windowEnd;
  }

  // 2) 기간 이벤트 (session / round)
  const start = new Date(event.startDate);
  const end = new Date(event.endDate ?? event.startDate);

  return end >= windowStart && start <= windowEnd;
}
