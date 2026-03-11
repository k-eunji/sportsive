// src/lib/groupEventsByDate.ts

import type { Event } from "@/types";
import { eventToCard, EventCardModel } from "./eventToCard";

export function groupEventsByDate(events: Event[]) {
  const grouped: Record<string, EventCardModel[]> = {};

  const cards = events.map(eventToCard);

  cards.forEach((card) => {
    const e = card.event;

    // 🎾 tournament / session
    if (e.kind === "session" && e.startDate) {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate ?? e.startDate);

      const d = new Date(start);

      while (d <= end) {
        const key = d.toISOString().slice(0, 10);

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(card);

        d.setDate(d.getDate() + 1);
      }

      return;
    }

    // normal event
    const key = (e.date ?? e.utcDate ?? e.startDate).slice(0, 10);

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(card);
  });

  return grouped;
}