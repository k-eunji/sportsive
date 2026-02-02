// src/app/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types";

import { EventList } from "@/app/components/EventList";
import { buildNowStatus } from "@/lib/nowDashboard";

// visit log
import { shouldLogVisit } from "@/lib/visitThrottle";
import { getClientId } from "@/lib/clientId";
import { isReturn24h } from "@/lib/returnCheck";
import { detectEntryReason } from "@/lib/entryReason";

// location
import { useLocationMode } from "@/app/components/home/useLocationMode";
import {
  useUserLocation,
  haversineKm,
} from "@/app/components/home/useUserLocation";

// UI
import LocationAnchor from "@/app/components/home/LocationAnchor";
import LocationSheet from "@/app/components/home/LocationSheet";
import PriceIntentBar, {
  PriceFilter,
} from "@/app/components/home/PriceIntentBar";

// area helpers
import { extractRegions, extractCities } from "@/lib/eventAreas";

/* =========================
   DATE HELPERS
========================= */

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

export default function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [weekCount, setWeekCount] = useState(1);

  // price filter
  const [priceFilter, setPriceFilter] =
    useState<PriceFilter>("all");

  // observer location state
  const [locationOpen, setLocationOpen] = useState(false);
  const [observerRegion, setObserverRegion] =
    useState<string | null>(null);
  const [observerCity, setObserverCity] =
    useState<string | null>(null);

  // area index (for LocationSheet)
  const [areaIndex, setAreaIndex] = useState<any[]>([]);

  // location
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
    }).catch(() => {});
  }, []);

  /* =========================
     EVENTS LOAD
  ========================= */
  useEffect(() => {
    (async () => {
      // 1️⃣ 리스트용 이벤트 (가볍게)
      const evRes = await fetch("/api/events?window=30d");
      const evData = await evRes.json();
      setEvents(evData.events ?? []);

      // 2️⃣ 위치 선택용 공간 구조 (넉넉하게)
      const areaRes = await fetch("/api/events?window=180d");
      const areaData = await areaRes.json();
      setAreaIndex(areaData.areas ?? []);
    })();
  }, []);

  /* =========================
     FILTERED EVENTS
  ========================= */
  const filteredEvents = useMemo(() => {
    return events.filter((e: any) => {
      // 📍 위치 ON
      if (hasLocation && pos) {
        if (!e.location) return false;
        try {
          if (haversineKm(pos, e.location) > 50) return false;
        } catch {
          return false;
        }
      }

      // 👀 위치 OFF + observer city
      if (!hasLocation && observerCity) {
        if (e.city !== observerCity) return false;
      }

      // 💰 가격 필터
      if (priceFilter === "free" && e.isPaid) return false;
      if (priceFilter === "paid" && !e.isPaid) return false;

      return true;
    });
  }, [events, hasLocation, pos, observerCity, priceFilter]);

  /* =========================
     DATE WINDOW
  ========================= */
  const visibleEvents = useMemo(() => {
    const now = new Date();
    const start = startOfDay(now);
    const end = addDays(start, weekCount * 7);

    return filteredEvents.filter((e: any) => {
      const raw = e.date ?? e.utcDate ?? e.startDate;
      if (!raw) return false;
      const d = new Date(raw);
      return d >= start && d < end;
    });
  }, [filteredEvents, weekCount]);

  /* =========================
     TODAY STATUS
  ========================= */
  const todayStatus = useMemo(() => {
    return buildNowStatus(
      hasLocation || observerCity ? filteredEvents : events,
      "today"
    );
  }, [events, filteredEvents, hasLocation, observerCity]);

  /* =========================
     AREA DATA
  ========================= */
  const regions = useMemo(
    () => extractRegions(areaIndex),
    [areaIndex]
  );

  const cities = useMemo(
    () =>
      observerRegion
        ? extractCities(areaIndex, observerRegion)
        : [],
    [areaIndex, observerRegion]
  );

  /* =========================
     RENDER
  ========================= */
  return (
    <main>
      {/* HERO */}
      <header className="max-w-3xl mx-auto px-4 pt-6 pb-6 space-y-3">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <LocationAnchor
              hasLocation={hasLocation}
              observerCity={observerCity}
              onOpenLocationSheet={() => setLocationOpen(true)}
            />

            <PriceIntentBar
              value={priceFilter}
              onChange={setPriceFilter}
            />
          </div>

          {/* OPEN MAP CTA */}
          <a
            href="/app"
            className="
              text-sm font-semibold
              text-foreground
              underline underline-offset-4
              hover:opacity-80
              transition
            "
          >
            Open map
          </a>
        </div>
        <h1 className="text-3xl font-bold">
          Is your city alive today?
        </h1>

        <p className="text-lg font-medium">
          {todayStatus.text}
        </p>

        <p className="text-sm text-muted-foreground">
          Official tickets & directions — in one tap.
        </p>
      </header>

      {/* LIST */}
      <section className="max-w-3xl mx-auto px-4 pb-10">
        <EventList events={visibleEvents} />

        <button
          onClick={() => setWeekCount((c) => c + 1)}
          className="
            w-full py-6 text-sm font-semibold
            text-muted-foreground hover:text-foreground
            transition
          "
        >
          Next 7 days →
        </button>
      </section>

      {/* LOCATION SHEET */}
      {locationOpen && (
        <LocationSheet
          regions={regions}
          cities={cities}
          observerRegion={observerRegion}
          onPickRegion={(r) => {
            setObserverRegion(r);
            setObserverCity(null);
          }}
          onPickCity={(c) => {
            setObserverCity(c);
            setLocationOpen(false);
          }}
          onClose={() => setLocationOpen(false)}
        />
      )}
    </main>
  );
}
