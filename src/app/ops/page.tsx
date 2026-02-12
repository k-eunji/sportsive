//src/app/ops/page.tsx

"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import type { Event } from "@/types";

import HomeMapStage from "@/app/ops/components/home/HomeMapStage";
import HomeMapSnapCard from "@/app/ops/components/map-hero/HomeMapSnapCard";
import DatePresetBar from "@/app/ops/components/home/DatePresetBar";

import { useUserLocation } from "@/app/ops/components/home/useUserLocation";
import { track } from "@/lib/track";

import type { HomeEventMapRef } from "@/app/ops/components/map-hero/HomeEventMap";
import type { AreaIndex } from "@/types/area";

import { getClientId } from "@/lib/clientId";
import { isReturn24h } from "@/lib/returnCheck";
import { shouldLogVisit } from "@/lib/visitThrottle";
import { detectEntryReason } from "@/lib/entryReason";

import { getPeakBucket } from "@/lib/infra/peak";
import type { PeakScope } from "@/types/infra";

import OperationalStatusMobile from "@/app/ops/components/home/OperationalStatusMobile";
import { buildTimeBuckets } from "@/lib/impact/buildTimeBuckets";

import { useAnchorLocation } from "@/app/ops/anchor/useAnchorLocation";
import { detectAnchorArea } from "@/app/ops/anchor/detectAnchorCandidates";
import AnchorSetupSheet from "@/app/ops/anchor/AnchorSetupSheet";
import type { AttentionLevel } from "@/lib/infra/attentionLevel";

import OperationalOverviewPanel, {
  type OperationalPanelProps,
} from "@/app/ops/components/panel/OperationalOverviewPanel";

import OperationalStatusHeader from
  "@/app/ops/components/home/OperationalStatusHeader";

import { buildRangeImpact } from "@/lib/impact/buildRangeImpact";
import MobileOpsView from "@/app/ops/components/mobile/MobileOpsView";

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

type ViewMode = "event_operator" | "league" | "club";

/* =====================
   Date helpers
===================== */

type TimeViewMode = "events" | "impact";

function getStartDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
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

function toLocalDateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function formatActiveAreaLabel(area: ActiveArea) {
  if (area.type === "all") return "Portfolio-wide";
  if (area.type === "region") return `Regional footprint`;
  if (area.type === "city") return `Local footprint`;
  return "";
}

function formatRegionLabel(r: string) {
  if (r === "ENGLAND") return "England";
  if (r === "SCOTLAND") return "Scotland";
  if (r === "WALES") return "Wales";
  return r;
}

function getMovementWindow(
  buckets: { minute: number; value: number }[],
  peakMinute: number,
  ratio = 0.7
) {
  const idx = buckets.findIndex(b => b.minute === peakMinute);
  if (idx === -1) return null;

  const peakValue = buckets[idx].value;
  const threshold = peakValue * ratio;

  let start = peakMinute;
  let end = peakMinute;

  // backward
  for (let i = idx - 1; i >= 0; i--) {
    if (buckets[i].value >= threshold) start = buckets[i].minute;
    else break;
  }

  // forward
  for (let i = idx + 1; i < buckets.length; i++) {
    if (buckets[i].value >= threshold) end = buckets[i].minute;
    else break;
  }

  return { start, end };
}

/* =====================
   Page
===================== */

export default function HomePage() {
  const mapRef = useRef<HomeEventMapRef | null>(null);
  const didPanToUserRef = useRef(false); 
  const [areaIndex, setAreaIndex] = useState<AreaIndex[]>([]);
  const [currentEvents, setCurrentEvents] = useState<Event[]>([]);
  const [snapEvent, setSnapEvent] = useState<Event | null>(null);

  const [activeArea, setActiveArea] = useState<ActiveArea>({
    type: "all",
  });


  const [activeDate, setActiveDate] = useState<Date>(
    startOfLocalDay(new Date())
  );

  const [viewMode, setViewMode] =
    useState<ViewMode>("event_operator");

  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [appliedBounds, setAppliedBounds] =
    useState<google.maps.LatLngBoundsLiteral | null>(null);

  const [sharedEventId, setSharedEventId] = useState<string | null>(null);
  const [sharedSource, setSharedSource] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const [timeOpen, setTimeOpen] = useState(false);

  const { hasAnchor, setAnchor } = useAnchorLocation();
  const [anchorOpen, setAnchorOpen] = useState(false);

  const isEventView = viewMode === "event_operator";
  const isLeagueView = viewMode === "league";
  const isClubView  = viewMode === "club";
  
  const isLocalFootprint = activeArea.type === "city";

  const { pos } = useUserLocation({
    enabled: !hasAnchor && !isLocalFootprint,
  });
  const didDismissAnchorRef = useRef(false);

  /* =====================
     Initial load
  ===================== */

  useEffect(() => {
    track("home_loaded");

    (async () => {
      const areaRes = await fetch("/api/events?window=180d");
      const areaData = await areaRes.json();
      setAreaIndex(areaData.areas ?? []);

      const curRes = await fetch("/api/events?window=60d");
      const curData = await curRes.json();
      setCurrentEvents(curData.events ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!currentEvents.length) return;

    const first = getStartDate(currentEvents[0]);
    if (!first) return;

    setActiveDate(startOfLocalDay(first));
  }, [currentEvents]);

  /* =====================
     Share entry
  ===================== */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSharedEventId(params.get("eventId"));
    setSharedSource(params.get("src"));
  }, []);

  useEffect(() => {
    if (!sharedEventId || !currentEvents.length || !mapRef.current) return;

    const ev = currentEvents.find(
      (e) => String(e.id) === sharedEventId
    );
    if (!ev) return;

    mapRef.current.focus(String(ev.id));
    setSnapEvent(ev);

    track("snapcard_opened_from_share", {
      eventId: sharedEventId,
      source: sharedSource ?? "unknown",
    });
  }, [sharedEventId, currentEvents, sharedSource]);

  useEffect(() => {
    setActiveRange(null);
  }, [activeDate, activeArea]);

  /* =====================
     Filtering (ACTIVE DATE 기준)
  ===================== */

  const analysisEvents = useMemo(() => {
    const activeKey = toLocalDateKey(activeDate);

    return currentEvents.filter((e: any) => {
      const start = getStartDate(e);
      if (!start) return false;
      if (toLocalDateKey(start) !== activeKey) return false;

      if (appliedBounds && e.location) {
        if (!isInBounds(e.location, appliedBounds)) return false;
      }

      return true;
    });
  }, [currentEvents, activeDate, appliedBounds]);

  const mapEvents = useMemo(() => {
    const activeKey = toLocalDateKey(activeDate);

    return currentEvents.filter((e: any) => {
      const start = getStartDate(e);
      if (!start) return false;

      if (toLocalDateKey(start) !== activeKey) return false;

      if (!timeOpen && appliedBounds && e.location) {
        if (!isInBounds(e.location, appliedBounds)) return false;
      }

      return true;
    });
  }, [currentEvents, activeDate, appliedBounds, timeOpen]);


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
    if (activeArea.type === "city") {
      return { type: "city", name: activeArea.name };
    }
    if (activeArea.type === "region") {
      return { type: "region", name: activeArea.name };
    }
    return { type: "all" };
  }, [activeArea]);

  const factors = useMemo<FactorItem[]>(
    (): FactorItem[] => {
      const map = new Map<string, number>();

      for (const e of analysisEvents) {
        let key: string;

        if (viewMode === "club") {
          if (
            activeArea.type === "city" &&
            e.city === activeArea.name
          ) {
            key = "Your area"; // ✅ 내 지역은 따로 묶기
          } else {
            key = e.city ?? "Nearby events";
          }
          key = e.city ?? "Nearby events";
        } else if (viewMode === "league") {
          key = e.competition ?? "Other competitions";
        } else {
          key = e.competition ?? e.sport ?? "Other";
        }

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
              : "low") as AttentionLevel,
        }))
        .sort((a, b) => b.count - a.count);
    },
    [analysisEvents, viewMode] // 🔥 이것도 반드시 추가
  );

  const attentionLevel: AttentionLevel | null =
    peakBucket
      ? peakBucket.count >= 4
        ? "high"
        : peakBucket.count >= 2
        ? "medium"
        : "low"
      : null;

  const operationalSignal = useMemo(() => {
    if (!peakBucket || attentionLevel === "low") return null;

    if (isLeagueView) {
      return `Concurrent fixtures detected around ${peakBucket.hour}:00`;
    }
    if (isClubView) {
      return `Nearby events overlap around ${peakBucket.hour}:00`;
    }
    return `Highest overlap detected around ${peakBucket.hour}:00`;
  }, [peakBucket, attentionLevel, isLeagueView, isClubView]);

  const attentionHint =
    attentionLevel === "high"
      ? "Consider crowd flow and staffing readiness"
      : attentionLevel === "medium"
      ? "Monitor overlapping start times"
      : null;
    

  const peakDateLabel = useMemo(() => {
    const today = startOfLocalDay(new Date());
    if (+activeDate === +today) return "Today";

    return activeDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }, [activeDate]);

  const impactBuckets = useMemo(() => {
    return buildTimeBuckets(analysisEvents);
  }, [analysisEvents]);

  const movementSummary = useMemo(() => {
    const summary = buildRangeImpact(impactBuckets, {
      start: 9,
      end: 22,
    });

    if (!summary.peakMinute) {
      return {
        peakMinute: null,
        peakValue: 0,
        window: null,
      };
    }

    return {
      peakMinute: summary.peakMinute,
      peakValue: summary.peakValue,
      window: getMovementWindow(
        impactBuckets,
        summary.peakMinute
      ),
    };
  }, [impactBuckets]);

  const anchorAreaLabel = useMemo(() => {
    return detectAnchorArea(pos, areaIndex);
  }, [pos, areaIndex]);

  // 🔥 위치 공유 → 자동 지역 스코프 설정
  useEffect(() => {
    // 1️⃣ 위치 없으면 아무 것도 안 함
    if (!pos) return;

    // 2️⃣ 이미 사용자가 지역을 골랐으면 자동 개입 ❌
    if (activeArea.type !== "all") return;

    // 3️⃣ area index 아직 없으면 대기
    if (!areaIndex.length) return;

    const label = detectAnchorArea(pos, areaIndex);
    if (!label) return;

    /**
     * detectAnchorArea 반환값 예:
     *  - "Manchester area detected"
     *  - "London area detected"
     */
    const cityName = label
      .replace(" area detected", "")
      .replace(" region detected", "");

    setActiveArea({
      type: "city",
      name: cityName,
    });
  }, [pos, areaIndex, activeArea.type]);

  useEffect(() => {
    console.log("currentEvents", currentEvents.length);
    console.log("analysisEvents", analysisEvents.length);
    console.log("timeBuckets", timeBuckets);
  }, [currentEvents, analysisEvents, timeBuckets]);

  const didAskAnchorRef = useRef(false);

  useEffect(() => {
    if (didAskAnchorRef.current) return;
  }, [hasAnchor]);

  const scopeLabel = useMemo(() => {
    const area =
      activeArea.type === "all"
        ? "Portfolio-wide"
        : activeArea.type === "region"
        ? `${activeArea.name} footprint`
        : activeArea.type === "city"
        ? `${activeArea.name} area`
        : "";

    return area;
  }, [activeArea, activeDate]);

  const didUserPickCountry = useRef(false);

  const lastMapViewRef = useRef<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);

  useEffect(() => {
    if (!pos) return;
    if (hasAnchor) return;
    if (didPanToUserRef.current) return; // 🔥 핵심

    mapRef.current?.panTo(pos);
    didPanToUserRef.current = true;      // 딱 한 번만
  }, [pos, hasAnchor]);

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
      scopeType: peakScope.type,
      dateLabel: peakDateLabel,

      activeDate,
      onDateChange: setActiveDate,
      hasAnchor,
      onOpenAnchor: () => setAnchorOpen(true),

      criticalWindow: peakBucket
        ? {
            from: `${peakBucket.hour}:00`,
            to: `${peakBucket.hour + 1}:00`,
          }
        : null,

      riskSummary: {
        low: Math.max(0, analysisEvents.length - (peakBucket?.count ?? 0)),
        medium: peakBucket ? Math.floor(peakBucket.count / 2) : 0,
        high: peakBucket?.count ?? 0,
      },

      hourlyImpact: timeBuckets.map((b) => ({
        hour: b.hour,
        value: b.count,
        level:
          b.count >= 4
            ? "high"
            : b.count >= 2
            ? "medium"
            : "low",
      })),

      factors,
      movementSummary,
      viewMode,
      showMovement: isEventView,
    }),

    [
      scopeLabel,
      peakScope.type,        // 🔥 의존성에도 추가
      peakBucket,
      peakDateLabel,
      analysisEvents.length,
      timeBuckets,
      factors,
      movementSummary,
      isEventView,
      viewMode,
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
        attentionHint={attentionHint}
      />

      {/* MOBILE MESSAGE */}
      <div className="md:hidden px-4 py-2 text-xs text-muted-foreground text-center">
        For full operational insights, view on a larger screen.
      </div>

      {/* VIEW MODE TOGGLE */}
      <div className="hidden md:flex px-4 py-2 bg-background/80 backdrop-blur shadow-sm justify-end">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">
            Viewing as
          </span>  

          <select
            value={viewMode}
            onChange={(e) =>
              setViewMode(e.target.value as ViewMode)
            }
            className="
              rounded-md
              border
              bg-background
              px-2
              py-1
              text-xs
              font-medium
            "
          >
            <option value="event_operator">
              Event
            </option>
            <option value="league">
              League
            </option>
            <option value="club">
              Club
            </option>
          </select>
        </div>
      </div>

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
          className={`
            relative
            flex-1
            min-h-0
            ${mobileExpanded ? "pb-[500px]" : "pb-[160px]"}
            md:pb-0
          `}
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
              onDiscoverFromMap={(id) => {
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

          <button
            onClick={() => setAnchorOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-muted/40 hover:bg-muted"
          >
            {hasAnchor
              ? "Reference set"
              : "Set reference location"}

          </button>

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
          hourlyImpact={timeBuckets.map(b => ({
            hour: b.hour,
            value: b.count,
          }))}
          activeDate={activeDate}
          onDateChange={setActiveDate}
          hasAnchor={hasAnchor}
          onOpenAnchor={() => setAnchorOpen(true)}
          onExpandChange={setMobileExpanded}
        />
      </div>

      {anchorOpen && (
        <AnchorSetupSheet
          areaLabel={anchorAreaLabel}
          onSubmit={(label, point) => {
            setAnchor({
              id: "custom",
              label,
              type: "custom",
              lat: point.lat,
              lng: point.lng,
              source: "user",
            });

            mapRef.current?.panTo(point);
            setAnchorOpen(false);
          }}
          onClose={() => {
            didDismissAnchorRef.current = true; // ✅ 핵심
            setAnchorOpen(false);
          }}
        />
      )}

    </main>
  );
}
