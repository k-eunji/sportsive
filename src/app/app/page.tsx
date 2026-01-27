//src/app/app/page.tsx

"use client";

import { useEffect, useMemo, useState, useRef  } from "react";
import type { Event } from "@/types";

import HomeMapStage from "@/app/components/home/HomeMapStage";
import NowHeroScopeBar from "@/app/components/home/NowHeroScopeBar";

import HomeMapSnapCard from "@/app/components/map-hero/HomeMapSnapCard";

import LocationSheet from "@/app/components/home/LocationSheet";
import { useLocationMode } from "@/app/components/home/useLocationMode";
import { useUserLocation, haversineKm } from "@/app/components/home/useUserLocation";
import { extractRegions, extractCities } from "@/lib/eventAreas";
import { track } from "@/lib/track";
import type { HomeEventMapRef } from "@/app/components/map-hero/HomeEventMap";
import type { TimeScope } from "@/lib/nowDashboard";
import { calcCityCenter } from "@/lib/calcCityCenter";
import MapStatusPill from "@/app/components/home/MapStatusPill";
import type { AreaIndex } from "@/types/area";
import { getDefaultDurationMs } from "@/lib/eventTime";
import { getClientId } from "@/lib/clientId";
import { isReturn24h } from "@/lib/returnCheck";
import { shouldLogVisit } from "@/lib/visitThrottle";

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function nextWeekendRange(now: Date) {
  const base = startOfLocalDay(now);
  const day = base.getDay(); // 0 Sun ... 6 Sat
  const toSat = day === 6 ? 0 : (6 - day + 7) % 7;
  const sat = new Date(base);
  sat.setDate(sat.getDate() + toSat);
  const mon = new Date(sat);
  mon.setDate(mon.getDate() + 2);
  return { start: sat, end: mon };
}

function isInBounds(
  location: { lat: number; lng: number },
  bounds: google.maps.LatLngBoundsLiteral
) {
  return (
    location.lat <= bounds.north &&
    location.lat >= bounds.south &&
    location.lng <= bounds.east &&
    location.lng >= bounds.west
  );
}

// session = tennis tournaments, horse-racing meetings, etc.

function isSession(e: any) {
  return e.kind === "session";
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export default function HomePage() {
  const [areaIndex, setAreaIndex] = useState<AreaIndex[]>([]);
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]); // 이번 주 표시용

  const { hasLocation } = useLocationMode();
  const { pos } = useUserLocation({ enabled: hasLocation });
    
  const mapRef = useRef<HomeEventMapRef | null>(null);
  const [snapEvent, setSnapEvent] = useState<Event | null>(null);

  // observer mode (no geo permission)
  const [observerRegion, setObserverRegion] = useState<string | null>(null);
  const [observerCity, setObserverCity] = useState<string | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const HOME_RADIUS_KM = 25;

  const [timeScope, setTimeScope] = useState<TimeScope>("today");
  const [heroExpanded, setHeroExpanded] = useState(true);
  const [sharedEventId, setSharedEventId] = useState<string | null>(null);
  const [sharedSource, setSharedSource] = useState<string | null>(null);
  const [enteredFromShare, setEnteredFromShare] = useState(false);

  const [mapViewMode, setMapViewMode] =
    useState<"user" | "global" | "observer">(
      hasLocation ? "user" : "observer"
    );

  const toggleMapView = () => {
    if (!hasLocation || !mapRef.current) return;

    if (mapViewMode === "user") {
      // 🌍 전체 히트맵으로
      setMapViewMode("global");
      setAppliedBounds(null);
      setPendingBounds(null);

      mapRef.current.resetToAll();
      track("map_view_global_from_user");
    } else {
      // 📍 내 위치로 복귀
      setMapViewMode("user");

      if (pos) {
        mapRef.current.panTo({
          lat: pos.lat,
          lng: pos.lng,
        });
      }

      track("map_view_user_from_global");
    }
  };
  const showNowHero = hasLocation || observerCity || !hasLocation;

  const [pendingBounds, setPendingBounds] =
    useState<google.maps.LatLngBoundsLiteral | null>(null);

  const [appliedBounds, setAppliedBounds] =
    useState<google.maps.LatLngBoundsLiteral | null>(null);

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    // 1️⃣ 기존 코드 (그대로 둠)
    track("home_loaded");
    (async () => {
      // ⬅️ 공간 구조용 (나라/도시 추출)
      const areaRes = await fetch("/api/events?window=180d");
      const areaData = await areaRes.json();
      setAreaIndex(areaData.areas ?? []);

      // ⬅️ 실제 지도/마커용 (이번 주)
      const curRes = await fetch("/api/events?window=7d");
      const curData = await curRes.json();
      setCurrentEvents(curData.events ?? []);
    })();
  }, []);

  useEffect(() => {
    if (hasLocation) {
      setMapViewMode("user");
    }
  }, [hasLocation]);

  // observer → located 전환 감지
  useEffect(() => {
    if (hasLocation && observerCity) {
      setObserverRegion(null);
      setObserverCity(null);
      track("observer_to_located");
    }
  }, [hasLocation]);

  // city 선택 시
  useEffect(() => {
    if (observerCity) {
      localStorage.setItem("sportsive_observer_city", observerCity);
    }
  }, [observerCity]);

  useEffect(() => {
    if (!observerCity || !mapRef.current) return;

    // 1) ✅ 이벤트 없어도 이동: areaIndex(center)로 이동
    const area = areaIndex.find(a => a.city === observerCity);
    if (area?.center) {
      mapRef.current.panTo(area.center);
      return;
    }

    // 2) (fallback) 혹시 areaIndex에 없으면 기존 방식(이벤트 평균)으로 이동
    const center = calcCityCenter(currentEvents, observerCity);
    if (center) {
      mapRef.current.panTo(center);
    }
  }, [observerCity, areaIndex, currentEvents]);

  useEffect(() => {
    if (!hasLocation || !pos || !mapRef.current) return;
    if (sharedEventId) return; // 🔥 공유 링크 진입이면 내 위치로 안 감

    mapRef.current.panTo({
      lat: pos.lat,
      lng: pos.lng,
    });
  }, [hasLocation, pos, sharedEventId]);


  // ✅ 공간 구조는 areaIndex 기준
  const regions = useMemo(
    () => extractRegions(areaIndex),
    [areaIndex]
  );

  const cities = useMemo(
    () => (observerRegion ? extractCities(areaIndex, observerRegion) : []),
    [areaIndex, observerRegion]
  );

  // filteredEvents useMemo 내부
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const todayStart = startOfLocalDay(now);

    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekend = nextWeekendRange(now);

    return currentEvents.filter((e: any) => {
      /* ======================
        1️⃣ 날짜 파싱
      ====================== */
      const start = getStartDate(e);
      if (!start) return false;

      // session 이벤트면 기간 사용
      const isSessionEvent = isSession(e);
      const sessionStart = isSessionEvent ? new Date(e.startDate) : start;
      const sessionEnd = isSessionEvent
        ? new Date(e.endDate)
        : new Date(start.getTime() + getDefaultDurationMs(e));

      /* ======================
        2️⃣ 시간 필터 (scope 통합)
      ====================== */

      // scopeStart / scopeEnd 계산
      let scopeStart: Date;
      let scopeEnd: Date;

      switch (timeScope) {
        case "today":
          scopeStart = todayStart;
          scopeEnd = todayEnd;
          break;

        case "tomorrow":
          scopeStart = tomorrowStart;
          scopeEnd = tomorrowEnd;
          break;

        case "weekend":
          scopeStart = weekend.start;
          scopeEnd = weekend.end;
          break;

        case "week":
        default:
          scopeStart = now;
          scopeEnd = weekEnd;
          break;
      }

      // session / non-session 공통 처리
      const inScope = isSessionEvent
        ? overlaps(sessionStart, sessionEnd, scopeStart, scopeEnd)
        : start >= scopeStart && start < scopeEnd;

      if (!inScope) return false;

      /* ======================
        3️⃣ 위치 필터 (항상 적용)
      ====================== */

      // 📍 위치 공유 ON → 내 주변
      if (hasLocation && pos && mapViewMode === "user") {
        if (!e.location?.lat || !e.location?.lng) return false;

        const distKm = haversineKm(pos, {
          lat: e.location.lat,
          lng: e.location.lng,
        });

        if (distKm > HOME_RADIUS_KM) return false;
      }

      // 👀 위치 공유 OFF + 도시 선택
      if (!hasLocation && observerCity) {
        if (e.city !== observerCity) return false;
      }

      /* ======================
        4️⃣ Search this area
      ====================== */
      if (appliedBounds && e.location) {
        if (!isInBounds(e.location, appliedBounds)) return false;
      }

      return true;
    });
  }, [
    currentEvents,
    hasLocation,
    pos,
    observerCity,
    timeScope,
    appliedBounds,
    mapViewMode,
  ]);


  // ✅ City Pulse 전용 (위치 필터 제거)
  const pulseEvents = useMemo(() => {
    const now = new Date();
    const todayStart = startOfLocalDay(now);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    return currentEvents.filter((e: any) => {
      const start = getStartDate(e);
      if (!start) return false;

      if (isSession(e)) {
        const sStart = new Date(e.startDate);
        const sEnd = new Date(e.endDate);
        return overlaps(sStart, sEnd, todayStart, todayEnd);
      }

      return start >= todayStart && start < todayEnd;
    });
  }, [currentEvents]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const eid = params.get("eventId");

    setSharedEventId(eid);
    setSharedSource(params.get("src"));

    if (eid) {
      setEnteredFromShare(true); // 🔥 추가
    }
  }, []);

  // ✅ 공유 링크 진입 시: 내 주변 필터 강제 해제
  useEffect(() => {
    if (!sharedEventId) return;

    setMapViewMode("global"); // 🔥 이 한 줄이 핵심
  }, [sharedEventId]);


  useEffect(() => {
    if (!currentEvents.length) return;
    if (!sharedEventId) return;
    if (!mapRef.current) return;

    const ev = currentEvents.find(e => String(e.id) === sharedEventId);
    if (!ev) return;

    // 🔥 지도 먼저 포커스
    mapRef.current.focus(String(ev.id));

    // 🔥 카드 상태 동기화
    setSnapEvent(ev);

    track("snapcard_opened_from_share", {
      eventId: sharedEventId,
      source: sharedSource ?? "unknown",
    });
  }, [currentEvents, sharedEventId, sharedSource]);

  useEffect(() => {
    track("home_loaded");

    if (shouldLogVisit()) {
      fetch("/api/log/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: getClientId(),
          is_within_first_24h: isReturn24h(),
        }),
      });
    }
  }, []);

  return (
    <main className="relative min-h-screen">
      {/* FULLSCREEN MAP */}
      <div className="fixed inset-0">
        <HomeMapStage
          ref={mapRef}
          events={sharedEventId ? currentEvents : filteredEvents}
          timeScope={timeScope} 
          onDiscoverFromMap={(id) => {
            const ev = filteredEvents.find(e => e.id === id) ?? null;
            setSnapEvent(ev);
          }}
          onBoundsChanged={setPendingBounds}
        />

      </div>

      {/* 🔍 NEARBY SPORTS SCAN BUTTON (observer only) */}
      {!hasLocation && (
        <button
          onClick={() => setLocationOpen(true)}
          className="
            fixed right-4
            bottom-[calc(env(safe-area-inset-bottom)+220px)]
            z-[70]
            w-10 h-10
            rounded-full
            bg-black
            flex items-center justify-center
            shadow-lg
          "
          aria-label="Scan nearby sports"
        >
          <span className="relative">
            <span className="block w-2 h-2 bg-white rounded-full" />
            <span className="absolute inset-0 rounded-full border border-white/40 animate-ping" />
          </span>
        </button>
      )}

      {/* 🔘 MAP VIEW TOGGLE BUTTON (located user only) */}
      {hasLocation && (
        <button
          onClick={toggleMapView}
          className="
            fixed right-4
            bottom-[calc(env(safe-area-inset-bottom)+220px)]
            z-[70]
            w-10 h-10
            rounded-full
            bg-black
            flex items-center justify-center
            shadow-lg
          "
          aria-label={
            mapViewMode === "user"
              ? "View all events"
              : "Back to my location"
          }
        >
          {mapViewMode === "user" ? "🌍" : "📍"}
        </button>
      )}

      {/* NOW HERO (MAIN UI) */}
      {showNowHero && (
        <div
          className="
            fixed z-40
            left-1/2 -translate-x-1/2
            bottom-[calc(env(safe-area-inset-bottom)+12px)]
            w-full max-w-3xl
            pointer-events-none
          "
        >
          <div className="px-4 pointer-events-auto">
            {/* ✅ 항상 보이는 필터 바 */}
            <div
              className="
                h-14
                rounded-full
                bg-background/80
                backdrop-blur
                ring-1 ring-border/40
                flex items-center justify-center
              "
              onClick={() => setHeroExpanded(true)}
            >
              {/* 👉 NowHero에서 필터 UI만 분리해서 컴포넌트화 */}
              <NowHeroScopeBar
                scope={timeScope}
                onScopeChange={setTimeScope}
              />
            </div>
          </div>
        </div>
      )}

      {/* LOCATION SHEET (observer only) */}
      {locationOpen && (
        <LocationSheet
          regions={regions}
          cities={cities}
          observerRegion={observerRegion}
          onPickRegion={(r) => {
            // ✅ ALL 선택 (LocationSheet에서 null을 보냄)
            if (r === null) {
              setObserverRegion(null);
              setObserverCity(null);

              setAppliedBounds(null);
              setPendingBounds(null);

              setHeroExpanded(false); // 리스트 접고
              setSnapEvent(null);     // 카드 닫고

              mapRef.current?.resetToAll(); // 🔥 지도 + 상태 리셋

              track("home_region_all_selected");
              setLocationOpen(false);
              return;
            }

            // ✅ 특정 region 선택
            setObserverRegion(r);
            setObserverCity(null);
            track("home_region_selected", { r });
          }}

          onPickCity={(c) => {
            setObserverCity(c);
            setLocationOpen(false);
          }}

          onClose={() => setLocationOpen(false)}
        />
      )}

      {/* 🟢 MAP STATUS PILL (today only) */}
      {timeScope === "today" && filteredEvents.length > 0 && (
        <MapStatusPill
          events={filteredEvents}
          scope={mapViewMode}
        />
      )}

      {snapEvent && (
        <HomeMapSnapCard
          event={snapEvent}
          onClose={() => {
            mapRef.current?.closeSnap();  // 🔴 지도 원상복귀
            setSnapEvent(null);
          }}
        />
      )}

    </main>
  );
}
