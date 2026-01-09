//src/utils/getEventTimingLabel.ts

export function getEventTimingLabel(date: Date) {
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const eventDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays =
    Math.round((eventDay.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";

  // 금/토/일이면 주말
  const day = eventDay.getDay(); // 0=Sun, 5=Fri, 6=Sat
  if (diffDays <= 3 && (day === 5 || day === 6 || day === 0)) {
    return "This weekend";
  }

  return "Upcoming";
}
