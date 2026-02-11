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
  const now = new Date();

  // 이번 주 토요일 계산
  const today = new Date();
  const day = today.getDay();
  const diffToSaturday = (6 - day + 7) % 7;

  const saturday = new Date(today);
  saturday.setDate(today.getDate() + diffToSaturday);
  saturday.setHours(0, 0, 0, 0);

  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);

  return all.filter((e) => {
    if (String(e.id) === String(current.id)) return false;
    if (!e.city || e.city !== current.city) return false;

    const d = new Date(e.date);

    return d >= now && d >= saturday && d <= sunday;
  });
}
