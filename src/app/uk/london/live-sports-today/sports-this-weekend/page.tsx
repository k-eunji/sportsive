//src/app/uk/london/sports-this-weekend/page.tsx

"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/types";
import WeekendList from "@/app/components/list/WeekendList";
import { getDefaultScope } from "@/lib/mockEvents"; // 👉 이 함수만 남겨도 OK

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("/api/events?window=7d")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []));
  }, []);

  return (
    <WeekendList
      title="Live sports near you"
      subtitle="Quick scan. No accounts. Official links."
      events={events}
      defaultScope={getDefaultScope(new Date())}
    />
  );
}
