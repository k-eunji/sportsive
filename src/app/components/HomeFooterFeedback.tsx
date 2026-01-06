// src/app/components/HomeFooterFeedback.tsx
"use client";

import { useEffect, useState } from "react";
import HelpShapeSportsive from "./HelpShapeSportsive";

const STORAGE_KEY_V2 = "sportsive_discovery_v2";

function hasReturningSignal(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    const days = parsed?.days ?? {};
    const keys = Object.keys(days);

    // Returning if they have any recorded day other than today,
    // OR if they have a "yesterday" entry.
    if (keys.length >= 2) return true;
    if (keys.length === 1) {
      // if they have history for a day but it's not today, still returning
      const onlyDay = keys[0];
      const today = new Date().toISOString().slice(0, 10);
      if (onlyDay !== today) return true;
    }

    // Also returning if they have ever celebrated, as a weak signal
    const celebrated = parsed?.celebratedByDate ?? {};
    if (Object.keys(celebrated).length > 0) return true;

    return false;
  } catch {
    return false;
  }
}

export default function HomeFooterFeedback() {
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    setReturning(hasReturningSignal());
  }, []);

  // ✅ First-time visitors: don’t show “contact the founder” yet.
  if (!returning) return null;

  return <HelpShapeSportsive />;
}
