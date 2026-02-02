// src/app/components/tracking/EventPageTracker.tsx

"use client";

import { useEffect } from "react";
import { getClientId } from "@/lib/clientId";

export default function EventPageTracker({
  eventId,
  sport,
  city,
}: {
  eventId: string;
  sport?: string;
  city?: string;
}) {
  useEffect(() => {
    fetch("/api/log/event-page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        clientId: getClientId(),
        sport,
        city,
      }),
    });
  }, [eventId, sport, city]);

  return null;
}
