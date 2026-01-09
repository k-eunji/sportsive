//src/utils/formatEventTimeCard.ts

export function formatEventTimeCard(
  date: Date,
  eventRegion?: string
) {
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today · ${time}`;
  if (isTomorrow) return `Tomorrow · ${time}`;

  const day = date.toLocaleDateString([], { weekday: "short" });

  // 해외 유저 대비: 지역만 살짝
  if (eventRegion) {
    return `${day} · ${time} · ${eventRegion}`;
  }

  return `${day} · ${time}`;
}
