// src/app/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types";

import WeekendList from "@/app/components/list/WeekendList";
import { getDefaultScope } from "@/lib/mockEvents";

// ✅ visit log 관련 유틸
import { shouldLogVisit } from "@/lib/visitThrottle";
import { getClientId } from "@/lib/clientId";
import { isReturn24h } from "@/lib/returnCheck";
import { detectEntryReason } from "@/lib/entryReason";

// ✅ 위치 관련 훅
import { useLocationMode } from "@/app/components/home/useLocationMode";
import { useUserLocation, haversineKm } from "@/app/components/home/useUserLocation";

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);

  // ✅ 위치 상태
  const { hasLocation } = useLocationMode();
  const { pos } = useUserLocation({ enabled: hasLocation });

  /* =========================
     VISIT LOG
  ========================= */

  useEffect(() => {
    if (!shouldLogVisit()) return;

    fetch("/api/log/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: getClientId(),
        is_within_first_24h: isReturn24h(),
        entry_reason: detectEntryReason(),
      }),
    }).catch(() => {
      // 실패해도 UX 영향 없게 무시
    });
  }, []);

  /* =========================
     EVENTS LOAD
  ========================= */

  useEffect(() => {
    fetch("/api/events?window=30d")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []));
  }, []);

  /* =========================
     LOCATION FILTER
  ========================= */

  const filteredEvents = useMemo(() => {
    // 위치 없으면 전체 그대로
    if (!hasLocation || !pos) return events;

    // 위치 있으면 반경 필터
    return events.filter((e: any) => {
      if (!e.location) return false;

      try {
        return haversineKm(pos, e.location) <= 50; // ⭕ 50km 기준
      } catch {
        return false;
      }
    });
  }, [events, hasLocation, pos]);

  /* =========================
     COPY (중요)
  ========================= */

  const title = hasLocation
    ? "Live sports near you"
    : "Live sports happening now";

  const subtitle = hasLocation
    ? "Based on your location"
    : "Across the UK & Ireland";

  /* =========================
     RENDER
  ========================= */

  return (
    <WeekendList
      title={title}
      subtitle={subtitle}
      events={filteredEvents}
      defaultScope={getDefaultScope(new Date())}
    />
  );
}
