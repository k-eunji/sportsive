// src/app/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types";

import { EventList } from "@/app/components/EventList";
import { buildNowStatus } from "@/lib/nowDashboard";

// visit log
import { shouldLogVisit } from "@/lib/visitThrottle";
import { getClientId } from "@/lib/clientId";
import { detectEntryReason } from "@/lib/entryReason";

// location
import { useLocationMode } from "@/app/ops/components/home/useLocationMode";
import {
  useUserLocation,
  haversineKm,
} from "@/app/ops/components/home/useUserLocation";

// UI
import LocationAnchor from "@/app/components/LocationAnchor";
import LocationSheet from "@/app/components/LocationSheet";
import PriceIntentBar, {
  PriceFilter,
} from "@/app/components/PriceIntentBar";

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
  const isReturn = localStorage.getItem("sportsive_has_visited") === "true";

  const isLocationFiltering =
    hasLocation && pos === null;

  /* =========================
     VISIT LOG
  ========================= */
  useEffect(() => {
    if (!shouldLogVisit()) return;

    const isReturn =
      localStorage.getItem("sportsive_has_visited") === "true";

    fetch("/api/log/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: getClientId(),
        is_within_first_24h: isReturn, // ✅ 이름도 의미도 isReturn
        entry_reason: detectEntryReason(),
        document_visibility: document.visibilityState,
      }),
    }).catch(() => {});

    // ✅ 방문 표시 (다음부터는 재방문)
    localStorage.setItem("sportsive_has_visited", "true");
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

  
  const todayEvents = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return filteredEvents.filter((e: any) => {
      const raw = e.date ?? e.utcDate ?? e.startDate;
      if (!raw) return false;
      const d = new Date(raw);
      return d >= start && d < end;
    });
  }, [filteredEvents]);

  const todayBreakdown = useMemo(() => {
    const now = new Date();

    let live = 0;
    let soon = 0;
    let later = 0;

    for (const e of todayEvents as any[]) {
      const status = (e.status ?? "").toUpperCase();

      if (status === "LIVE") {
        live += 1;
        continue;
      }

      const raw = e.date ?? e.utcDate ?? e.startDate;
      if (!raw) continue;

      const start = new Date(raw);
      const diffH =
        (start.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffH <= 3) soon += 1;
      else later += 1;
    }

    return { live, soon, later };
  }, [todayEvents]);


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
      {/* HERO (Image-based) */}
        <section className="relative w-full min-h-[calc(420px+64px)] pt-[20px] overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url(/images/hero-city-sports.jpg)",
            }}
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 space-y-5 text-white">
            {/* Top utilities */}
            <div className="flex flex-wrap items-center gap-3">
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

            {/* Hero copy */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-2xl">
              Sports events, by time and location
            </h1>

            <p className="text-lg md:text-xl font-medium max-w-xl text-white/90">
              See where sports events overlap — and when it matters operationally
            </p>

            <p className="text-sm text-white/70 max-w-xl">
              Understand when and where events overlap.
            </p>


            {/* CTA */}
            <div className="pt-2">
              <a
                href="/ops"
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  bg-white text-black
                  px-5 py-3
                  text-sm font-semibold
                  hover:bg-white/90
                  transition
                "
              >
                View operational outlook →
              </a>
            </div>
          </div>
        </section>

      {/* LIST */}
      {/* ✅ TODAY SUMMARY (추가만) */}
      <section className="max-w-3xl mx-auto px-4 pb-4">
        <div className="rounded-2xl bg-muted/40 px-4 py-4 space-y-2">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Today
          </div>

          {todayEvents.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Nothing happening
            </div>
          )}

          {todayEvents.length > 0 && (
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              {todayBreakdown.live > 0 && (
                <span>LIVE ({todayBreakdown.live})</span>
              )}
              {todayBreakdown.soon > 0 && (
                <span>Starting soon ({todayBreakdown.soon})</span>
              )}
              {todayBreakdown.later > 0 && (
                <span>Later today ({todayBreakdown.later})</span>
              )}
            </div>
          )}
        </div>

        EventList {isLocationFiltering ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Finding events near you…
          </div>
        ) : (
          <EventList events={visibleEvents} />
        )}


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
