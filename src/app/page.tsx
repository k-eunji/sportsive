// src/app/page.tsx

"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/types";

import WeekendList from "@/app/components/list/WeekendList";
import { getDefaultScope } from "@/lib/mockEvents";

// ✅ visit log 관련 유틸
import { shouldLogVisit } from "@/lib/visitThrottle";
import { getClientId } from "@/lib/clientId";
import { isReturn24h } from "@/lib/returnCheck";
import { detectEntryReason } from "@/lib/entryReason";

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);

  // ✅ 1️⃣ 랜딩 진입 = visit log
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
      // ❌ 실패해도 UX 영향 없게 (조용히 무시)
    });
  }, []);

  // ✅ 2️⃣ 이벤트 데이터 로드 (기존 그대로)
  useEffect(() => {
    fetch("/api/events?window=30d")
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
