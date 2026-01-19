// src/app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types";

import WeekStrip from "@/app/components/home/WeekStrip";
import TodayDiscoveryList from "@/app/components/home/TodayDiscoveryList";
import HomeMapStage from "@/app/components/home/HomeMapStage";
import MapPanel from "@/app/components/home/MapPanel";
import type { ViewScope } from "@/app/components/home/RadiusFilter";

import LocationSheet from "@/app/components/home/LocationSheet";
import { useLocationMode } from "@/app/components/home/useLocationMode";
import { extractRegions, extractCities } from "@/lib/eventAreas";
import { track } from "@/lib/track";
import { useUserLocation, haversineKm } from "@/app/components/home/useUserLocation";
import { scopeToKm } from "@/lib/scopeDistance";


function isSameDay(d: Date, iso: string) {
  return d.toISOString().slice(0, 10) === iso;
}

function scopeLabel(scope: ViewScope) {
  if (scope === "nearby") return "Walking distance";
  if (scope === "city") return "Around you";
  if (scope === "country") return "Wider area";
  return "Worldwide";
}

function locationTitle({
  hasLocation,
  observerCity,
  observerRegion,
  regions,
}: {
  hasLocation: boolean;
  observerCity: string | null;
  observerRegion: string | null;
  regions: string[];
}) {
  if (hasLocation) return "Near you";
  if (observerCity) return observerCity;
  if (observerRegion) return observerRegion;

  // 👇 여기 중요
  if (regions.length === 1) return regions[0];

  return "Choose location";
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const { hasLocation } = useLocationMode();

  const [scope, setScope] = useState<ViewScope>("country");
  const [radiusOpen, setRadiusOpen] = useState(false);

  // observer mode
  const [observerRegion, setObserverRegion] = useState<string | null>(null);
  const [observerCity, setObserverCity] = useState<string | null>(null);

  // week filter
  const [pickedDay, setPickedDay] = useState<string | null>(null);

  // map focus
  const [focusEventId, setFocusEventId] = useState<string | null>(null);

  const { pos } = useUserLocation({
    enabled: hasLocation,
  });

  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    track("events_page_loaded");
    (async () => {
      const res = await fetch("/api/events?window=7d");
      const data = await res.json();
      setEvents(data.events ?? []);
    })();
  }, []);

  const regions = useMemo(() => extractRegions(events), [events]);
  const cities = useMemo(
    () => (observerRegion ? extractCities(events, observerRegion) : []),
    [events, observerRegion]
  );

  const eventsWithoutDayFilter = useMemo(() => {
    return events.filter((e: any) => {
      // 위치 필터
      if (hasLocation && pos && scope !== "global") {
        if (!e.location?.lat || !e.location?.lng) return false;

        const distKm = haversineKm(pos, {
          lat: e.location.lat,
          lng: e.location.lng,
        });

        if (distKm > scopeToKm(scope)) return false;
      }

      // observer 필터
      if (!hasLocation) {
        if (observerRegion && e.region !== observerRegion) return false;
        if (observerCity && e.city !== observerCity) return false;
      }

      return true;
    });
  }, [events, hasLocation, pos, scope, observerRegion, observerCity]);


  const filteredEvents = useMemo(() => {
    return events.filter((e: any) => {
      // ===============================
      // 1️⃣ 위치 허용 유저 → 거리 필터
      // ===============================
      if (hasLocation && pos && scope !== "global") {
        if (!e.location?.lat || !e.location?.lng) return false;

        const distKm = haversineKm(pos, {
          lat: e.location.lat,
          lng: e.location.lng,
        });

        const limitKm = scopeToKm(scope);
        if (distKm > limitKm) return false;
      }

      // ===============================
      // 2️⃣ observer 유저 → region / city
      // ===============================
      if (!hasLocation) {
        if (observerRegion && e.region !== observerRegion) return false;
        if (observerCity && e.city !== observerCity) return false;
      }

      // ===============================
      // 3️⃣ day filter (공통)
      // ===============================
      if (pickedDay) {
        const dt = new Date(e.date ?? e.utcDate ?? Date.now());
        if (!isSameDay(dt, pickedDay)) return false;
      }

      return true;
    });
  }, [events, hasLocation, pos, scope, observerRegion, observerCity, pickedDay]);

  if (!events.length) return null;

  return (
    <main className="pb-[120px] space-y-6">

      {/* ===============================
        TOP BAR (location + scope)
      =============================== */}
      <section className="w-full pt-4">
        <div className="w-full px-4 md:max-w-3xl md:mx-auto space-y-1">
          
          {/* ✅ LOCATION = TITLE */}
          <button
            onClick={() => {
              if (!hasLocation) setLocationOpen(true);
            }}
            className="text-lg font-semibold tracking-tight text-left"
          >
            {locationTitle({
              hasLocation,
              observerCity,
              observerRegion,
              regions,
            })}
          </button>

          {/* ✅ META LINE */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {hasLocation && <span>{scopeLabel(scope)}</span>}

            {hasLocation && (
              <button
                onClick={() => setRadiusOpen(true)}
                className="underline underline-offset-2"
              >
                Change
              </button>
            )}
          </div>

        </div>
      </section>

      {locationOpen && (
        <LocationSheet
          regions={regions}
          cities={cities}
          observerRegion={observerRegion}
          onPickRegion={(r) => {
            setObserverRegion(r);
            setObserverCity(null);
            track("location_region_selected", { r });
          }}


          onPickCity={(c) => {
            setObserverCity(c);
            setLocationOpen(false);
            track("location_city_selected", { c });
          }}
          onClose={() => setLocationOpen(false)}
        />
      )}

      {/* ===============================
        Radius sheet
      =============================== */}
      {radiusOpen && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setRadiusOpen(false)}
            aria-label="Close"
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-background px-5 pt-4 pb-[env(safe-area-inset-bottom)]">
            <p className="text-sm font-semibold mb-3">Search area</p>

            {[
              { label: "Nearby", scope: "nearby" },
              { label: "Around me", scope: "city" },
              { label: "Wider", scope: "country" },
              { label: "Global", scope: "global" },
            ].map((o) => (
              <button
                key={o.scope}
                onClick={() => {
                  setScope(o.scope as ViewScope);
                  setRadiusOpen(false);
                  track("scope_changed", { scope: o.scope });
                }}
                className={`w-full mb-2 px-4 py-3 rounded-2xl text-left text-sm font-medium ${
                  scope === o.scope
                    ? "bg-black text-white"
                    : "bg-muted/40"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      
      {/* ===============================
        WEEK STRIP (날짜 필터)
      =============================== */}
      <section className="w-full">
        <div className="w-full px-4 md:max-w-3xl md:mx-auto"></div>
          <WeekStrip
            events={eventsWithoutDayFilter}
            activeIso={pickedDay}                 // ✅ 추가
            onPickDay={(iso) => {
              setPickedDay((prev) => (prev === iso ? null : iso));  // ✅ 토글 추천
              track("events_day_filtered", { iso });
            }}
          />
        </section>
      {/* ===============================
        LIST (결정 단계)
      =============================== */}
      <section className="w-full">
        <div className="w-full px-4 md:max-w-3xl md:mx-auto"></div>
          <TodayDiscoveryList
            events={filteredEvents}
            scope={hasLocation ? scope : "country"}
            observerMode={!hasLocation}
            observerRegion={observerRegion}
            observerCity={observerCity}
            onPick={(id) => {
              setFocusEventId(id);
              track("events_list_item_clicked", { eventId: id });
            }}
          />
        </section>                          

      {/* ===============================
        MAP (탐색 보조)
      =============================== */}
      <section className="w-full">
        <MapPanel defaultOpen>
          <HomeMapStage
            events={filteredEvents}
            focusEventId={focusEventId}
            autoSurprise={false}
            onClose={() => setFocusEventId(null)}
            onSurprise={() => {}}
            onDiscoverFromMap={(id) =>
              track("events_map_discovered", { eventId: id })
            }
          />
        </MapPanel>
      </section>
    </main>
  );
}
