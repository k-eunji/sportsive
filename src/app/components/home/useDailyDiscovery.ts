//src/app/components/home/useDailyDiscovery.ts

"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/track";
import { logActivity } from "./activity";

const STORAGE_KEY = "sportsive_discovery_v3";

function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

type Store = {
  days: Record<string, string[]>;
  celebratedByDate: Record<string, boolean>;
  stamps: Record<string, { key: string; label: string; lastSeen: number }>;
};

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { days: {}, celebratedByDate: {}, stamps: {} };
    const parsed = JSON.parse(raw);
    return {
      days: parsed?.days ?? {},
      celebratedByDate: parsed?.celebratedByDate ?? {},
      stamps: parsed?.stamps ?? {},
    };
  } catch {
    return { days: {}, celebratedByDate: {}, stamps: {} };
  }
}

function saveStore(s: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useDailyDiscovery() {
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [returning, setReturning] = useState(false);
  const [justCelebrated, setJustCelebrated] = useState(false);

  useEffect(() => {
    const store = loadStore();
    const today = dayKey();
    const yesterday = dayKey(-1);

    setDiscoveredIds(store.days?.[today] ?? []);
    setYesterdayCount((store.days?.[yesterday] ?? []).length);

    const keys = Object.keys(store.days ?? {});
    setReturning(keys.some((k) => k !== today) || Object.keys(store.celebratedByDate ?? {}).length > 0);
  }, []);

  useEffect(() => {
    const store = loadStore();
    const today = dayKey();

    store.days[today] = discoveredIds;

    if (discoveredIds.length === 3 && !store.celebratedByDate[today]) {
      store.celebratedByDate[today] = true;
      saveStore(store);

      setJustCelebrated(true);
      track("daily_discovery_completed");
      setTimeout(() => setJustCelebrated(false), 2200);
      return;
    }

    saveStore(store);
  }, [discoveredIds]);

  const addDiscover = (eventId: string) => {
    setDiscoveredIds((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]));
    logActivity({ type: "discover", at: Date.now() });
    track("match_discovered", { eventId });
    };
    
  const ritualLine = useMemo(() => {
    if (!returning) return null;
    if (yesterdayCount > 0 && discoveredIds.length === 0) {
      return `Yesterday you explored ${yesterdayCount}. Today will look different.`;
    }
    if (discoveredIds.length > 0) {
      return `This changes daily. Come back tomorrow for a new snapshot.`;
    }
    return `A quick look tomorrow feels different.`;
  }, [returning, yesterdayCount, discoveredIds.length]);

  return {
    discoveredIds,
    yesterdayCount,
    returning,
    justCelebrated,
    ritualLine,
    addDiscover,
  };
}
