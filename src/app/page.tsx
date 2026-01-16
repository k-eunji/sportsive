// src/app/page.tsx

"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { Event } from "@/types";

import MobileHero from "./components/home/MobileHero";
import TodayDiscoveryList from "./components/home/TodayDiscoveryList";
import DiscoveryProgress from "./components/home/DiscoveryProgress";
import HomeFooterFeedback from "./components/HomeFooterFeedback";
import HomeMapStage from "./components/home/HomeMapStage";
import StampsBar from "./components/home/StampsBar";
import RadiusFilter from "./components/home/RadiusFilter";
import type { ViewScope } from "./components/home/RadiusFilter";
import { useDistanceUnit } from "./components/home/useDistanceUnit";

import { useDailyDiscovery } from "./components/home/useDailyDiscovery";
import { addStamp } from "./components/home/stamps";
import { track } from "@/lib/track";

// 이미 있는 컴포넌트(네가 올린 파일에 존재)
import LivePreview from "./components/LivePreview";
import WhatIsSportsiveCompact from "./components/WhatIsSportsiveCompact";

// 신규
import First15Overlay from "./components/home/First15Overlay";
import { useLocationMode } from "./components/home/useLocationMode";
import { extractRegions, extractCities } from "@/lib/eventAreas";

export default function Home() {
  const params = useSearchParams();
  const isDemo = params?.get("mode") === "demo";

  const [events, setEvents] = useState<Event[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [radiusOpen, setRadiusOpen] = useState(false);
  const { mode, hasLocation } = useLocationMode();

  const { unit, toggle } = useDistanceUnit();
  const [scope, setScope] = useState<ViewScope>("country");

  const [focusEventId, setFocusEventId] = useState<string | null>(null);
  const [pendingSurprise, setPendingSurprise] = useState(false);

  const [observerRegion, setObserverRegion] = useState<string | null>(null);
  const [observerCity, setObserverCity] = useState<string | null>(null);

  const regions = useMemo(
    () => extractRegions(events),
    [events]
  );

  const cities = useMemo(
    () =>
      observerRegion
        ? extractCities(events, observerRegion)
        : [],
    [events, observerRegion]
  );


  const scopeLabel =
    scope === "global"
      ? "Worldwide"
      : scope === "country"
      ? "Across your country"
      : scope === "city"
      ? "Around your city"
      : "Near you";

  const { discoveredIds, justCelebrated, ritualLine, returning, addDiscover } =
    useDailyDiscovery();

  useEffect(() => {
    track("home_loaded");
    (async () => {
      const res = await fetch("/api/events?window=7d");
      const data = await res.json();
      setEvents(data.events ?? []);
    })();
  }, []);

  const mapStageRef = useRef<HTMLDivElement | null>(null);

  const eventById = useMemo(() => {
    const m = new Map<string, any>();
    (events as any[]).forEach((e) => m.set(e.id, e));
    return m;
  }, [events]);

  const onDiscover = (eventId: string) => {
    addDiscover(eventId);
    const e = eventById.get(eventId);
    if (e) addStamp(e);
  };

  const handlePickFromList = (id: string) => {
    setFocusEventId(id);
    setShowMap(true);
    setPendingSurprise(false);
    onDiscover(id);

    // ⭐ 지도 영역으로 자동 스크롤
    requestAnimationFrame(() => {
      mapStageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const resetObserver = () => {
    setObserverCity(null);
    setObserverRegion(null);
  };


  const handleHeroSurprise = () => {
    setShowMap(true);
    setFocusEventId(null);
    setPendingSurprise(true);

    requestAnimationFrame(() => {
      mapStageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    track("map_opened", { source: "hero_surprise" });
  };

  useEffect(() => {
    const saved = localStorage.getItem("sportsive_view_scope");
    if (
      saved === "nearby" ||
      saved === "city" ||
      saved === "country" ||
      saved === "global"
    ) {
      setScope(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sportsive_view_scope", scope);
  }, [scope]);

  if (!events.length) return null;

  return (
    <main className="pb-[120px] space-y-6">
      {/* ✅ 첫 방문 15초 오버레이 (1회만) */}
      {!isDemo && <First15Overlay />}

      {/* 1) Primary action */}
      <MobileHero onSurprise={handleHeroSurprise} />

      {/* 2) “지금” 신호 (조용한 활동/라이브) */}
      <LivePreview />

      {/* 4) 필터는 보조로 내려서 ‘결정 피로’ 줄이기 */}
      <RadiusFilter
        scope={scope}
        onOpen={() => setRadiusOpen(true)}
        enabled={hasLocation}
      />

      {radiusOpen && (
      <div className="fixed inset-0 z-50">
        {/* backdrop */}
        <button
          className="absolute inset-0 bg-black/40"
          onClick={() => setRadiusOpen(false)}
          aria-label="Close radius filter"
        />

        {/* sheet */}
        <div
          className="
            absolute bottom-0 left-0 right-0
            rounded-t-3xl
            bg-background
            px-5 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]
          "
        >
          <p className="text-sm font-semibold mb-3">Search area</p>

          {[
            { label: "Nearby", scope: "nearby", desc: "Walking distance" },
            { label: "Around me", scope: "city", desc: "Your city" },
            { label: "Wider", scope: "country", desc: "This country" },
            { label: "Global", scope: "global", desc: "Everywhere" },
          ].map((o) => (
            <button
              key={o.scope}
              onClick={() => {
                setScope(o.scope as ViewScope);
                setRadiusOpen(false);
                track("scope_changed", { scope: o.scope });
              }}
              className={`
                w-full text-left
                px-4 py-3 rounded-2xl
                text-sm font-medium
                ${
                  scope === o.scope
                    ? "bg-black text-white"
                    : "bg-muted/40"
                }
              `}
            >
              <div className="flex justify-between items-center">
                <span>{o.label}</span>
                <span className="text-xs opacity-70">{o.desc}</span>
              </div>
            </button>
          ))}

        </div>
      </div>
    )}


      {/* ===============================
        Observer flow (위치 미허용)
      =============================== */}

      {/* 1) 위치 없고, 아직 region 안 고른 상태 */}
      {!hasLocation && !observerRegion && (
        <section className="px-6">
          <p className="text-sm font-semibold mb-2">
            Choose a region
          </p>

          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setObserverRegion(r)}
              className="w-full mb-2 px-4 py-3 rounded-2xl border"
            >
              {r}
            </button>
          ))}
        </section>
      )}

      {/* 2) region은 골랐고, city가 여러 개인 경우 */}
      {!hasLocation && observerRegion && !observerCity && cities.length > 1 && (
        <section className="px-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">
              Cities in {observerRegion}
            </p>

            <button
              onClick={() => setObserverRegion(null)}
              className="text-xs text-blue-600 hover:underline"
            >
              Change region
            </button>
          </div>

          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setObserverCity(c)}
              className="w-full mb-2 px-4 py-3 rounded-2xl border"
            >
              {c}
            </button>
          ))}
        </section>
      )}

      {/* ===============================
        Discovery list 진입
      =============================== */}
      {!hasLocation && observerRegion && (
        <div className="px-6">
          <button
            onClick={() => {
              resetObserver();
              track("observer_reset_region");
            }}
            className="text-xs font-semibold text-blue-600 hover:underline mb-2"
          >
            ← Change region
          </button>
        </div>
      )}

      {(hasLocation || observerRegion) && (
        <TodayDiscoveryList
          events={events}
          scope={hasLocation ? scope : "country"}
          observerMode={!hasLocation}
          observerRegion={observerRegion}
          observerCity={observerCity}
          onPick={handlePickFromList}
        />
      )}

      {/* 5) 소프트 리텐션(스탬프/리추얼/축하) */}
      <StampsBar discoveredToday={discoveredIds.length} />

      <DiscoveryProgress
        count={discoveredIds.length}
        justCelebrated={justCelebrated}
        ritualLine={ritualLine}
      />

      {/* 6) Map stage (의도 있을 때만) */}
      {showMap && hasLocation && (
        <div ref={mapStageRef} className="pt-1">
          <HomeMapStage
            key={pendingSurprise ? "map-surprise" : "map-normal"}
            events={events}
            focusEventId={focusEventId}
            autoSurprise={pendingSurprise}
            onClose={() => {
              setShowMap(false);
              setPendingSurprise(false);
              setFocusEventId(null);
            }}
            onSurprise={() => {}}
            onDiscoverFromMap={onDiscover}
          />

        </div>
      )}

      {/* ✅ demo 모드에서만 “설명 카드” 노출 */}
      {isDemo && <WhatIsSportsiveCompact />}

      {/* returning 유저만 피드백 */}
      {returning && <HomeFooterFeedback />}
    </main>
  );
}
