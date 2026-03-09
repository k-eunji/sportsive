//src/app/ops/page.tsx

"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import type { Event } from "@/types";
import Link from "next/link";

import HomeMapStage from "@/app/ops/components/home/HomeMapStage";
import HomeMapSnapCard from "@/app/ops/components/map-hero/HomeMapSnapCard";
import DatePresetBar from "@/app/ops/components/home/DatePresetBar";

import { track } from "@/lib/track";

import type { HomeEventMapRef } from "@/app/ops/components/map-hero/HomeEventMap";
import type { AreaIndex } from "@/types/area";

import { getClientId } from "@/lib/clientId";
import { isReturn24h } from "@/lib/returnCheck";
import { shouldLogVisit } from "@/lib/visitThrottle";
import { detectEntryReason } from "@/lib/entryReason";

import { getPeakBucket } from "@/lib/infra/peak";
import type { PeakScope } from "@/types/infra";

import type { AttentionLevel } from "@/lib/infra/attentionLevel";
import { sportEmoji } from "@/lib/sportEmoji";

import OperationalOverviewPanel, {
  type OperationalPanelProps,
} from "@/app/ops/components/panel/OperationalOverviewPanel";

import OperationalStatusHeader from
  "@/app/ops/components/home/OperationalStatusHeader";

import MobileOpsView from "@/app/ops/components/mobile/MobileOpsView";
import { getEventTimeState } from "@/lib/eventTime";

/* =====================
   Types
===================== */

type ActiveArea =
  | { type: "all" }                 // ✅ 진짜 All
  | { type: "country"; code: "UK" | "IE" }
  | { type: "region"; name: string }
  | { type: "city"; name: string };

  type FactorItem = {
  label: string;
  count: number;
  level: AttentionLevel;
};

/* =====================
   Date helpers
===================== */

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function getTimelineTitle(e: any) {
  const sport = (e.sport ?? "").toLowerCase();

  // 🏇 Horse racing → 코스명
  if (sport.includes("horse")) {
    return e.venue ?? e.title ?? "Race meeting";
  }

  // 🎾 Tennis / 🎯 Darts → title
  if (sport === "tennis" || sport === "darts") {
    return e.title ?? "Event";
  }

  // 🏀⚽ 기타 → 홈 vs 원정
  if (e.homeTeam && e.awayTeam) {
    return `${e.homeTeam} vs ${e.awayTeam}`;
  }

  return e.title ?? "Event";
}

function getTimelineTimeLabel(e: any) {
  const sport = (e.sport ?? "").toLowerCase();

  // 🏇 Horse racing → sessionTime 표시
  if (sport.includes("horse")) {
    return e.sessionTime ?? e.payload?.sessionTime ?? "";
  }

  // 일반 스포츠 → 시각 표시
  const start = getStartDate(e);
  if (!start) return "";

  return start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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

function toUTCDateKey(d: Date) {
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

/* =====================
   Page
===================== */

export default function HomePage() {
  const mapRef = useRef<HomeEventMapRef | null>(null);
  const [areaIndex, setAreaIndex] = useState<AreaIndex[]>([]);
  const [snapEvent, setSnapEvent] = useState<Event | null>(null);

  const [activeArea, setActiveArea] = useState<ActiveArea>({
    type: "all",
  });


  const [activeDate, setActiveDate] = useState<Date>(
    startOfLocalDay(new Date())
  );

  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [appliedBounds, setAppliedBounds] =
    useState<google.maps.LatLngBoundsLiteral | null>(null);

  const [sharedEventId, setSharedEventId] = useState<string | null>(null);
  const [sharedSource, setSharedSource] = useState<string | null>(null);

  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const [mapEventsSource, setMapEventsSource] = useState<Event[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<Event[]>([]);

  const isLocalFootprint = activeArea.type === "city";

  /* =====================
     Initial load
  ===================== */

  useEffect(() => {
    track("home_loaded");

    (async () => {
      const areaRes = await fetch("/api/events?window=180d");
      const areaData = await areaRes.json();
      setAreaIndex(areaData.areas ?? []);

      const mapRes = await fetch("/api/events?window=180d");
      const mapData = await mapRes.json();
      setMapEventsSource(mapData.events ?? []);

      const histRes = await fetch("/api/events?window=180d");
      const histData = await histRes.json();
      setHistoricalEvents(histData.events ?? []);
    })();
  }, []);

  /* =====================
     Share entry
  ===================== */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSharedEventId(params.get("eventId"));
    setSharedSource(params.get("src"));
  }, []);

  useEffect(() => {
    if (!sharedEventId || !mapEventsSource.length || !mapRef.current) return;

    const ev = mapEventsSource.find(
      (e) => String(e.id) === sharedEventId
    );
    if (!ev) return;

    mapRef.current.focus(String(ev.id));
    setSnapEvent(ev);

    track("snapcard_opened_from_share", {
      eventId: sharedEventId,
      source: sharedSource ?? "unknown",
    });
  }, [sharedEventId, mapEventsSource, sharedSource]);

  /* =====================
     Filtering (ACTIVE DATE 기준)
  ===================== */

  const analysisEvents = useMemo(() => {
    const activeKey = toUTCDateKey(activeDate);

    return mapEventsSource.filter((e: any) => {
      const start = getStartDate(e);
      if (!start) return false;

      if (toUTCDateKey(start) !== activeKey) return false;

      if (!e.location) return false;

      if (appliedBounds && !isInBounds(e.location, appliedBounds))
        return false;

      return true;
    });
  }, [mapEventsSource, activeDate, appliedBounds, activeHour]);

  /* =====================
    Baseline (30-day median)
  ===================== */

  const scopedHistoricalEvents = useMemo(() => {
    if (!appliedBounds) return historicalEvents;

    return historicalEvents.filter((e: any) => {
      if (!e.location) return false;
      return isInBounds(e.location, appliedBounds);
    });
  }, [historicalEvents, appliedBounds]);


  const historicalDailyCounts = useMemo(() => {
    const map = new Map<string, number>();

    for (const e of scopedHistoricalEvents) {
      const start = getStartDate(e);
      if (!start) continue;

      const key = toUTCDateKey(start);
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [scopedHistoricalEvents]);

  const baselineStats = useMemo(() => {
    if (!historicalDailyCounts.length) return null;

    const todayKey = toUTCDateKey(activeDate);
    const todayCount =
      historicalDailyCounts.find(d => d.date === todayKey)?.count ?? 0;

    const past30 = historicalDailyCounts
      .filter(d => d.date !== todayKey)
      .slice(-30)
      .map(d => d.count);

    if (!past30.length) return null;

    const sorted = [...past30].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    const delta = median > 0
      ? Math.round(((todayCount - median) / median) * 100)
      : 0;

    let label: "normal" | "elevated" | "unusual" = "normal";

    if (delta >= 30) label = "unusual";
    else if (delta >= 15) label = "elevated";

    const absoluteDiff = todayCount - median;

    return {
      todayCount,
      median,
      delta,
      absoluteDiff,
      label,
    };
  }, [historicalDailyCounts, activeDate]);

  /* =====================
    7-Day Trend
  ===================== */

  const sevenDayTrend = useMemo(() => {
    const result: { date: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(activeDate);
      d.setDate(d.getDate() - i);

      const key = toUTCDateKey(d);

      const count =
        historicalDailyCounts.find(h => h.date === key)?.count ?? 0;

      result.push({ date: key, count });
    }

    return result;
  }, [activeDate, historicalDailyCounts]);

  const sportBreakdown = useMemo(() => {
    const map = new Map<string, number>();

    for (const e of analysisEvents) {
      const key = (e.sport ?? "other").toLowerCase();
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([sport, count]) => ({
        sport,
        count,
        emoji: sportEmoji[sport] ?? "🏟️",   // ✅ 여기 수정
      }))
      .sort((a, b) => b.count - a.count);
  }, [analysisEvents]);

  const regionBreakdown = useMemo(() => {
    const map = new Map<string, number>();

    for (const e of analysisEvents) {
      const key = e.city ?? e.region ?? "Other";
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [analysisEvents]);

  const mapEvents = useMemo(() => {
    const activeKey = toUTCDateKey(activeDate);

    return mapEventsSource.filter((e: any) => {
      const start = getStartDate(e);
      if (!start) return false;

      if (toUTCDateKey(start) !== activeKey) return false;

      if (activeHour !== null) {
        if (start.getHours() !== activeHour) return false;
      }

      if (appliedBounds && e.location) {
        if (!isInBounds(e.location, appliedBounds)) return false;
      }

      return true;
    });
  }, [mapEventsSource, activeDate, appliedBounds, activeHour]);
    
  const visibleEvents = useMemo(() => {
    if (!appliedBounds) return mapEvents;

    return mapEvents.filter((e: any) => {
      if (!e.location) return false;

      return isInBounds(e.location, appliedBounds);
    });
  }, [mapEvents, appliedBounds]);

  const timelineEvents = useMemo(() => {
    const priority = (state: string) => {
      switch (state) {
        case "LIVE":
          return 0;
        case "SOON":
          return 1;
        case "UPCOMING":
          return 2;
        case "ENDED":
          return 3;
        default:
          return 4;
      }
    };

    return [...visibleEvents].sort((a, b) => {
      const stateA = getEventTimeState(a);
      const stateB = getEventTimeState(b);

      const pDiff = priority(stateA) - priority(stateB);
      if (pDiff !== 0) return pDiff;

      const da = getStartDate(a);
      const db = getStartDate(b);
      if (!da || !db) return 0;

      return da.getTime() - db.getTime();
    });
  }, [visibleEvents]);
  
  const timeBuckets = useMemo(() => {
    // ✅ 네가 원한 정확한 범위
    const START_HOUR = 9;
    const END_HOUR = 22;

    const buckets = Array.from(
      { length: END_HOUR - START_HOUR + 1 },
      (_, i) => ({
        hour: START_HOUR + i,
        count: 0,
      })
    );

    for (const e of analysisEvents) {
      const start = getStartDate(e);
      if (!start) continue;

      const h = start.getHours();

      // 🔥 핵심: 범위 밖 이벤트는 가장 가까운 시간으로 밀어넣기
      const clampedHour =
        h < START_HOUR
          ? START_HOUR
          : h > END_HOUR
          ? END_HOUR
          : h;

      const index = clampedHour - START_HOUR;
      buckets[index].count += 1;
    }

    return buckets;
  }, [analysisEvents]);

  const peakBucket = useMemo(() => {
    return getPeakBucket(timeBuckets);
  }, [timeBuckets]);

  const peakScope: PeakScope = useMemo(() => {
    if (appliedBounds) {
      return { type: "region", name: "Map view" };
    }
    return { type: "all" };
  }, [appliedBounds]);
  
  const factors = useMemo(() => {
    const map = new Map<string, number>();

    for (const e of analysisEvents) {
      const key =
        e.competition ??
        e.sport ??
        e.city ??
        "Other";

      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([label, count]) => ({
        label,
        count,
        level:
          (count >= 5
            ? "high"
            : count >= 2
            ? "medium"
            : "low") as AttentionLevel,   // 🔥 여기 추가
      }))
      .sort((a, b) => b.count - a.count);
  }, [analysisEvents]);

  const attentionLevel: AttentionLevel | null =
    peakBucket
      ? peakBucket.count >= 5
        ? "high"
        : peakBucket.count >= 3
        ? "medium"
        : "low"
      : null;

  const operationalSignal = useMemo(() => {
    if (!peakBucket) return null;

    return `Peak activity at ${peakBucket.hour}:00 · ${peakBucket.count} events`;
  }, [peakBucket]);

  const peakDateLabel = useMemo(() => {
    const today = startOfLocalDay(new Date());
    if (+activeDate === +today) return "Today";

    return activeDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }, [activeDate]);

  useEffect(() => {
    console.log("mapEventsSource", mapEventsSource.length);
    console.log("historicalEvents", historicalEvents.length);
    console.log("analysisEvents", analysisEvents.length);
    console.log("timeBuckets", timeBuckets);
  }, [mapEventsSource, historicalEvents, analysisEvents, timeBuckets]);

  const scopeLabel = useMemo(() => {
    if (appliedBounds) return "Map view";
    return "UK & Ireland";
  }, [appliedBounds]);

  const lastMapViewRef = useRef<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);

  const filterStateLabel = useMemo(() => {
    return `${scopeLabel} · ${peakDateLabel}`;
  }, [scopeLabel, peakDateLabel]);

  /* =====================
     Analytics
  ===================== */

  useEffect(() => {
    if (!shouldLogVisit()) return;

    fetch("/api/log/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: getClientId(),
        is_within_first_24h: isReturn24h(),
        entry_reason: detectEntryReason(),
        document_visibility: document.visibilityState,
      }),
    });
  }, []);

  /* =====================
     Regions / Cities
  ===================== */

  const panelProps = useMemo<OperationalPanelProps>(
    () => ({
      scopeLabel,
      filterStateLabel,
      scopeType: peakScope.type,
      dateLabel: peakDateLabel,
      sports: sportBreakdown,
      regions: regionBreakdown,

      activeDate,
      activeHour,
      onHourSelect: (hour) =>
        setActiveHour(prev => prev === hour ? null : hour),

      hourlyImpact: timeBuckets.map((b) => ({
        hour: b.hour,
        value: b.count,
        level:
          b.count >= 5
            ? "high"
            : b.count >= 3
            ? "medium"
            : "low",
      })),

      factors,

      // 🔥 여기 이렇게만 쓰면 됨
      baselineStats,
      sevenDayTrend,
    }),
    [
      scopeLabel,
      peakScope.type,
      filterStateLabel,
      activeHour,
      peakDateLabel,
      timeBuckets,
      factors,
      regionBreakdown,
      baselineStats,
      sportBreakdown,
      sevenDayTrend,
    ]
  );  
  

  /* =====================
     Render
  ===================== */

  return (
    <main className="relative md:h-full">
      {/* 🔥 OPERATIONAL STATUS HEADER */}
      <OperationalStatusHeader
        peak={peakBucket}
        scope={peakScope}
        dateLabel={peakDateLabel}
        operationalSignal={operationalSignal}
        attentionLevel={attentionLevel}
      />

      {/* MOBILE MESSAGE */}
      <div className="md:hidden px-4 py-2 text-xs text-muted-foreground text-center">
        For full operational insights, view on a larger screen.
      </div>

      <Link
        href="/"
        className="text-xs text-muted-foreground hover:underline"
      >
        ← Fan view
      </Link>

      <div className="
        flex
        min-h-0
        h-[calc(100svh-56px)]
        md:h-[calc(100vh-56px-110px)]
      ">

        {/* LEFT PANEL – desktop only */}
        <div className="hidden md:block h-full shrink-0">
          <OperationalOverviewPanel {...panelProps} />
        </div>

        {/* MAP AREA */}
        <div
          className="
            relative
            flex-1
            min-h-0
            pb-[180px]
            md:pb-0
          "
        >

          {/* gradient edge */}
          <div
            className="
              pointer-events-none
              absolute inset-y-0 left-0 w-8
              bg-gradient-to-r from-background/60 to-transparent
              z-10
            "
          />

          {/* MAP */}
          <div className="absolute inset-0">
            <HomeMapStage
              ref={mapRef}
              events={mapEvents}
              highlightedId={hoveredEventId} 
              onDiscoverFromMap={(id) => {
                setHoveredEventId(id); 
                lastMapViewRef.current =
                  mapRef.current?.getViewState() ?? null;

                const ev =
                  analysisEvents.find((e) => e.id === id) ?? null;
                setSnapEvent(ev);
              }}
              onBoundsChanged={setAppliedBounds}
            />
          </div>

          {/* SNAP CARD */}
          {snapEvent && (
            <HomeMapSnapCard
              event={snapEvent}
              onClose={() => {
                setSnapEvent(null);
                if (lastMapViewRef.current) {
                  mapRef.current?.restoreViewState(
                    lastMapViewRef.current
                  );
                }
              }}
            />
          )}

          {/* =====================
              TIMELINE LIST (DESKTOP)
          ===================== */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0 bg-background border-t max-h-[260px] overflow-y-auto z-20">
            <div className="px-6 py-4 space-y-2">

              {timelineEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No events in current map view.
                </p>
              )}

              {timelineEvents.map((e: any) => {
                const sportKey = (e.sport ?? "").toLowerCase().trim();
                const start = getStartDate(e);
                const hour = start?.getHours();
                const timeState = getEventTimeState(e);
                const isEnded = timeState === "ENDED";
                const isLive = timeState === "LIVE";

                const isPeak =
                  peakBucket && hour === peakBucket.hour;

                const isHovered =
                  hoveredEventId === String(e.id);

                return (
                  <div
                    key={e.id}
                    onMouseEnter={() =>
                      setHoveredEventId(String(e.id))
                    }
                    onMouseLeave={() =>
                      setHoveredEventId(null)
                    }
                    onClick={() => {
                      const id = String(e.id);

                      // 🔁 같은 카드를 다시 누르면 → 이전 화면 복구
                      if (hoveredEventId === id && lastMapViewRef.current) {
                        mapRef.current?.restoreViewState(lastMapViewRef.current);
                        setHoveredEventId(null);
                        lastMapViewRef.current = null;
                        return;
                      }

                      // 🔍 처음 누르는 경우 → 현재 뷰 저장 후 확대
                      lastMapViewRef.current =
                        mapRef.current?.getViewState() ?? null;

                      setHoveredEventId(id);
                      mapRef.current?.focus(id);
                    }}
                    className={[
                      "p-3 rounded-lg cursor-pointer border transition",
                      isHovered ? "bg-muted" : "",
                      isPeak ? "border-red-400" : "border-transparent",
                      isLive ? "border-red-400 bg-red-50/40" : "",
                      isEnded ? "opacity-60" : "",
                    ].join(" ")}
                  >
                    <p
                      className={[
                        "text-sm font-medium",
                        isEnded ? "text-muted-foreground" : "",
                      ].join(" ")}
                    >
                      {getTimelineTitle(e)}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getTimelineTimeLabel(e)}</span>
                      <span>
                        {sportEmoji[sportKey] ?? "🏟️"} {e.sport}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop only bottom controls */}
      <div className="hidden md:flex fixed inset-x-0 bottom-4 z-50 justify-center pointer-events-none">

        <div
          className="
            pointer-events-auto
            flex items-center gap-2
            px-3 py-2
            rounded-full
            bg-background/80
            backdrop-blur
            shadow-sm 
          "
        >
          <DatePresetBar
            activeDate={activeDate}
            onChange={setActiveDate}
            maxDays={60}
          />

        </div>
      </div>

      {/* 🔥 Mobile bottom sheet (루트 레벨) */}
      <div className="md:hidden">
        <MobileOpsView
          peakHour={peakBucket?.hour ?? null}
          peakCount={peakBucket?.count ?? 0}
          scopeLabel={scopeLabel}
          dateLabel={peakDateLabel}
          attentionLevel={attentionLevel}
          baselineStats={baselineStats}
          events={timelineEvents}
          activeDate={activeDate}
          onDateChange={setActiveDate}
        />
      </div>

    </main>
  );
}
