// src/lib/groupEventsByDate.ts

import type { Event } from "@/types";
import { eventToCard, EventCardModel } from "./eventToCard";

export function groupEventsByDate(events: Event[]) {
  const grouped: Record<string, EventCardModel[]> = {};

  events
    .map(eventToCard)
    .sort(
      (a, b) =>
        new Date(a.event.date ?? a.event.utcDate ?? a.event.startDate).getTime() -
        new Date(b.event.date ?? b.event.utcDate ?? b.event.startDate).getTime()
    )
    .forEach((card) => {
      if (!grouped[card.dateKey]) grouped[card.dateKey] = [];
      grouped[card.dateKey].push(card);
    });

  return grouped;
}