// src/app/components/map-hero/MapHero.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HomeEventMap, { HomeEventMapRef } from "./HomeEventMap";
import DiscoveryStatus from "./DiscoveryStatus";
import type { Event } from "@/types";
import { logEvent } from "@/lib/analytics";
import TomorrowTease from "./TomorrowTease";
import SoftButton from "@/components/ui/SoftButton";

const STORAGE_KEY_V2 = "sportsive_discovery_v2";

function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

type DiscoveryStoreV2 = {
  days: Record<string, string[]>;
  celebratedByDate: Record<string, boolean>;
};

function loadStore(): DiscoveryStoreV2 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        days: parsed?.days ?? {},
        celebratedByDate: parsed?.celebratedByDate ?? {},
      };
    }
  } catch {}
  return { days: {}, celebratedByDate: {} };
}

function saveStore(next: DiscoveryStoreV2) {
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(next));
}

export default function MapHero() {
  const [events, setEvents] = useState<Event[]>([]);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [justCelebrated, setJustCelebrated] = useState(false);
  const [returning, setReturning] = useState(false);

  const mapRef = useRef<HomeEventMapRef | null>(null);

  useEffect(() => {
    logEvent("home_loaded");

    const store = loadStore();
    const today = dayKey();
    const yesterday = dayKey(-1);

    setDiscoveredIds(store.days?.[today] ?? []);
    setYesterdayCount((store.days?.[yesterday] ?? []).length);

    const keys = Object.keys(store.days ?? {});
    setReturning(keys.some((k) => k !== today));
  }, []);

  useEffect(() => {
    const store = loadStore();
    const today = dayKey();

    store.days[today] = discoveredIds;

    if (discoveredIds.length === 3 && !store.celebratedByDate[today]) {
      store.celebratedByDate[today] = true;
      setJustCelebrated(true);
      setTimeout(() => setJustCelebrated(false), 2200);
      logEvent("daily_discovery_completed");
    }

    saveStore(store);
  }, [discoveredIds]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/events?limit=60");
      const data = await res.json();

      const now = new Date();
      const in7Days = new Date();
      in7Days.setDate(now.getDate() + 7);

      setEvents(
        (data.events ?? []).filter((e: any) => {
          const date = new Date(e.date ?? e.utcDate);
          return date >= now && date <= in7Days;
        })
      );
    }
    load();
  }, []);

  const handleDiscover = (eventId: string) => {
    setDiscoveredIds((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]));
    logEvent("match_discovered");
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

  if (!events.length) return null;

  return (
    <section id="map" className="mt-2 space-y-4">
      {/* A compact “control row” instead of a big hero block */}
      <div className="px-6">
        <div className="w-full md:max-w-3xl md:mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              Explore the next 7 days near you
            </p>
            <p className="text-xs text-gray-500 truncate">
              Tap pins to open a match · Discover 3 for a daily snapshot
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SoftButton
              as="button"
              onClick={() => {
                logEvent("surprise_clicked");
                mapRef.current?.surprise();
              }}
              className="px-4 py-2"
            >
              Surprise →
            </SoftButton>

            <SoftButton as="link" href="/events" className="px-4 py-2">
              Full map →
            </SoftButton>
          </div>
        </div>

        {/* Show “status” only AFTER they’ve discovered something */}
        {discoveredIds.length > 0 && (
          <div className="pt-3 flex flex-col items-center">
            <DiscoveryStatus
              discoveredCount={discoveredIds.length}
              yesterdayCount={yesterdayCount}
              justCelebrated={justCelebrated}
              returning={returning}
            />
            {ritualLine && (
              <p className="text-xs text-gray-500 pt-2 text-center">
                {ritualLine}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tomorrow tease: minimal + visual, not essay */}
      <div className="px-6">
        <div className="w-full md:max-w-3xl md:mx-auto">
          <TomorrowTease events={events} />
        </div>
      </div>

      {/* Map */}
      <div className="px-6">
        <div className="w-full md:max-w-3xl md:mx-auto">
          <HomeEventMap ref={mapRef} events={events} onDiscover={handleDiscover} />
        </div>
      </div>
    </section>
  );
}
