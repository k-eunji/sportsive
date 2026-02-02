// src/lib/groupEventsByDate.ts

import type { Event } from "@/types";
import { eventToCard, EventCardModel } from "./eventToCard";

export function groupEventsByDate(events: Event[]) {
  const grouped: Record<string, EventCardModel[]> = {};

  events
    .map(eventToCard)
    .sort(
      (a, b) =>
        new Date(a.dateKey).getTime() -
        new Date(b.dateKey).getTime()
    )
    .forEach((card) => {
      if (!grouped[card.dateKey]) grouped[card.dateKey] = [];
      grouped[card.dateKey].push(card);
    });

  return grouped;
}
