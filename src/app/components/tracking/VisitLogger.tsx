// src/app/components/VisitLogger.tsx
"use client";

import { useEffect } from "react";
import { shouldLogVisit } from "@/lib/visitThrottle";
import { getClientId } from "@/lib/clientId";
import { detectEntryReason } from "@/lib/entryReason";

export default function VisitLogger() {
  useEffect(() => {
    if (!shouldLogVisit()) return;

    const isReturn =
      localStorage.getItem("sportsive_has_visited") === "true";

    fetch("/api/log/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: getClientId(),
        is_within_first_24h: isReturn,
        entry_reason: detectEntryReason(),
        document_visibility: document.visibilityState,
      }),
    }).catch(() => {});

    localStorage.setItem("sportsive_has_visited", "true");
  }, []);

  return null;
}
