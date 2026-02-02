//src/lib/events/nearby.ts

import type { Event } from "@/types";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isWeekend(d: Date) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function buildNearbyToday(
  all: Event[],
  current: Event
): Event[] {
  const today = new Date();

  return all.filter((e) => {
    if (String(e.id) === String(current.id)) return false;
    if (!e.city || e.city !== current.city) return false;

    const d = new Date(e.date);
    return isSameDay(d, today);
  });
}

export function buildMoreThisWeekend(
  all: Event[],
  current: Event
): Event[] {
  return all.filter((e) => {
    if (String(e.id) === String(current.id)) return false;
    if (!e.city || e.city !== current.city) return false;

    const d = new Date(e.date);
    return isWeekend(d);
  });
}
