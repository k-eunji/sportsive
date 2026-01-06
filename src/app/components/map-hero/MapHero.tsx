// src/app/components/map-hero/MapHero.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HomeEventMap, { HomeEventMapRef } from "./HomeEventMap";
import DiscoveryStatus from "./DiscoveryStatus";
import type { Event } from "@/types";
import { logEvent } from "@/lib/analytics";

const STORAGE_KEY_V2 = "sportsive_discovery_v2";
const COPY_VARIANT_KEY = "sportsive_home_copy_variant";

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

type CopyVariant = "A" | "B";

function pickStableVariant(): CopyVariant {
  try {
    const existing = localStorage.getItem(COPY_VARIANT_KEY) as CopyVariant | null;
    if (existing === "A" || existing === "B") return existing;
    const v: CopyVariant = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(COPY_VARIANT_KEY, v);
    return v;
  } catch {
    return "A";
  }
}

function getCopy(variant: CopyVariant, returning: boolean) {
  const first = {
    A: {
      title: "See what sport looks like near you today",
      subtitle: "Try to discover 3 real matches around you.",
      cta: "Surprise me nearby →",
    },
    B: {
      title: "What’s happening in your area?",
      subtitle: "Explore a few local matches — no sign-up needed.",
      cta: "Pick one for me →",
    },
  };

  const back = {
    A: {
      title: "See what changed since yesterday",
      subtitle: "Today shows a different side of local sport.",
      cta: "Show me today’s matches →",
    },
    B: {
      title: "New day, different games",
      subtitle: "Local sport changes daily — take a quick look.",
      cta: "Surprise me today →",
    },
  };

  return returning ? back[variant] : first[variant];
}

export default function MapHero() {
  const [events, setEvents] = useState<Event[]>([]);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [justCelebrated, setJustCelebrated] = useState(false);
  const [returning, setReturning] = useState(false);
  const [variant, setVariant] = useState<CopyVariant>("A");

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

    setVariant(pickStableVariant());
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
      const res = await fetch("/api/events?limit=20");
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
    setDiscoveredIds((prev) =>
      prev.includes(eventId) ? prev : [...prev, eventId]
    );
    logEvent("match_discovered");
  };

  const copy = useMemo(() => getCopy(variant, returning), [variant, returning]);

  if (!events.length) return null;

  return (
    <section id="map" className="mt-6 space-y-4">
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {copy.title}
        </h1>

        <p className="text-sm text-gray-600">
          {copy.subtitle} <span className="opacity-70">· Next 7 days</span>
        </p>

        <DiscoveryStatus
          discoveredCount={discoveredIds.length}
          yesterdayCount={yesterdayCount}
          justCelebrated={justCelebrated}
          returning={returning}
        />

        <button
          onClick={() => {
            logEvent("surprise_clicked");
            mapRef.current?.surprise();
          }}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          {copy.cta}
        </button>

        {returning && (
          <p className="text-xs text-gray-500">
            Each day shows a different snapshot of local sport.
          </p>
        )}
      </div>

      <HomeEventMap ref={mapRef} events={events} onDiscover={handleDiscover} />
    </section>
  );
}
