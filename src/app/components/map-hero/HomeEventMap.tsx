// src/app/components/map-hero/HomeEventMap.tsx

"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { Event } from "@/types";
import { useGoogleMaps } from "@/components/GoogleMapsProvider";

const DEFAULT_ZOOM = 8;
const FOCUS_ZOOM = 13;


// ======== Signal spec constants ========
const SOON_WINDOW_MS = 2 * 60 * 60 * 1000; // 2h
const PRESENCE_RECENT_MS = 2 * 60 * 1000; // 2m "someone just opened this"
const PRESENCE_FADE_MS = 8 * 60 * 1000; // 8m "was here a moment ago"

type MarkerStatus = "DEFAULT" | "SOON" | "LIVE";
type TimeScope = "today" | "tomorrow" | "weekend" | "week";

function getEventStart(e: Event): Date | null {
  const raw = (e as any).date ?? (e as any).utcDate ?? (e as any).startDate;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function getMarkerStatus(e: Event): MarkerStatus {
  const now = Date.now();
  const start = getEventStart(e);
  const rawStatus = ((e as any).status ?? "").toString().toUpperCase();

  const isLive = rawStatus === "LIVE";
  const isSoon =
    !!start &&
    start.getTime() - now > 0 &&
    start.getTime() - now <= getSoonWindowMs(e);

  return isLive ? "LIVE" : isSoon ? "SOON" : "DEFAULT";
}

function markerBaseScaleForZoom(zoom: number) {
  if (zoom >= 14) return 4.8;
  if (zoom >= 12) return 5.4;
  if (zoom >= 10) return 6.0;
  return 6.6;
}


function thinByGrid(events: Event[], zoom: number) {
  const cellKm =
    zoom <= 10 ? 8 :
    zoom <= 12 ? 4 :
    2;

  const grid = new Map<string, Event>();

  for (const e of events) {
    if (!e.location) continue;

    const key =
      Math.floor(e.location.lat / (cellKm / 110)) + ":" +
      Math.floor(e.location.lng / (cellKm / 110));

    const prev = grid.get(key);
    if (!prev) {
      grid.set(key, e);
      continue;
    }

    // 우선순위: LIVE > SOON > DEFAULT
    const p = getMarkerStatus(prev);
    const n = getMarkerStatus(e);

    if (
      (n === "LIVE" && p !== "LIVE") ||
      (n === "SOON" && p === "DEFAULT")
    ) {
      grid.set(key, e);
    }
  }

  return Array.from(grid.values());
}

function getSoonWindowMs(e: Event) {
  switch ((e as any).sport) {
    case "football":
    case "rugby":
      return 2 * 60 * 60 * 1000; // 2h
    case "tennis":
      return 60 * 60 * 1000;     // 1h
    case "basketball":
      return 90 * 60 * 1000;     // 1.5h
    default:
      return 2 * 60 * 60 * 1000;
  }
}

function computePulse(phase: number) {
  // phase: 0..1
  // smooth pulse in [0..1]
  const t = phase * Math.PI * 2;
  return (Math.sin(t) + 1) / 2;
}

function getMarkerIcon(e: Event, zoom: number, phase: number): google.maps.Symbol {
  const status = getMarkerStatus(e);

  const base = markerBaseScaleForZoom(zoom);

  // Default is intentionally low presence so LIVE/SOON pops by contrast
  let fillColor = "#0f172a";
  let fillOpacity = 0.48;        // ⬅️ 확실히 보이게
  let scale = base * 1.1;
  // Live/Soon: signal, not POI
  if (status === "SOON") {
    // subtle pulse; still readable
    const p = computePulse(phase);
    fillColor = "#ef4444";
    fillOpacity = 0.70 + p * 0.18; // 0.70..0.88
    scale = base * (1.08 + p * 0.08); // 1.08..1.16
  }

  if (status === "LIVE") {
    // stronger pulse
    const p = computePulse(phase);
    fillColor = "#ef4444";
    fillOpacity = 0.82 + p * 0.15; // 0.82..0.97
    scale = base * (1.18 + p * 0.12); // 1.18..1.30
  }

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale,
    fillColor,
    fillOpacity,
    // add a subtle stroke to lift off the light map (this is what makes it "seen")
    strokeColor: "rgba(255,255,255,0.85)",
    strokeOpacity: status === "DEFAULT" ? 0.75 : 0.85,
    strokeWeight: status === "DEFAULT" ? 1.5 : 2,
  };
}

function getHaloIcon(zoom: number, phase: number): google.maps.Symbol {
  // A thin ring for SOON (and optionally LIVE) — helps "this is a signal" readability
  const base = markerBaseScaleForZoom(zoom);

  const p = computePulse(phase);
  const scale = base * (1.55 + p * 0.15); // expanding ring
  const opacity = 0.20 + p * 0.18;

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale,
    fillOpacity: 0,
    strokeColor: "rgba(239,68,68,1)",
    strokeOpacity: opacity,
    strokeWeight: 2,
  };
}

// =========================
// (기존 히트맵 보조 함수들: 남겨둠 — 혹시 다른 곳에서 참조할 수 있어 유지)
// ⚠️ 단, google.maps.visualization 타입은 제거(visualization lib 제거했기 때문)
// =========================
function buildHeatmapPoints(events: Event[]) {
  return events
    .filter((e) => e.location?.lat && e.location?.lng)
    .map((e) => {
      const status = getMarkerStatus(e);

      // weight is "influence", not color
      let weight = 1;
      if (status === "LIVE") weight = 3;
      else if (status === "SOON") weight = 2;

      return {
        location: new google.maps.LatLng(e.location!.lat, e.location!.lng),
        weight,
      };
    });
}

function spreadPoints(
  lat: number,
  lng: number,
  weight: number,
  zoom: number
): any[] {
  // zoom이 낮을수록 더 넓게 퍼짐
  const spreadMeters =
    zoom <= 6 ? 6000 :
    zoom <= 7 ? 3500 :
    zoom <= 8 ? 2000 :
    800;

  // weight이 클수록 점 개수 증가
  const count = Math.round(weight * 4);

  const points: any[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * spreadMeters;

    // meters → lat/lng 변환
    const dLat = (radius * Math.cos(angle)) / 111_000;
    const dLng =
      (radius * Math.sin(angle)) /
      (111_000 * Math.cos((lat * Math.PI) / 180));

    points.push({
      location: new google.maps.LatLng(lat + dLat, lng + dLng),
      weight: 1,
    });
  }

  return points;
}

function heatmapRadiusForZoom(zoom: number) {
  if (zoom <= 6) return 26;
  if (zoom === 7) return 34;
  if (zoom === 8) return 44;
  if (zoom === 9) return 58;
  return 0;
}

// =========================
// ✅ NEW: Soft Density (Canvas Overlay) helpers
// =========================
function densityRadiusPxForZoom(zoom: number) {
  // “근처” 감각: zoom 낮을수록 넓게
  if (zoom <= 6) return 58;
  if (zoom === 7) return 50;
  if (zoom === 8) return 40;
  if (zoom === 9) return 32;
  return 0;
}

function densityBlurPxForZoom(zoom: number) {
  if (zoom <= 6) return 38;
  if (zoom === 7) return 32;
  if (zoom === 8) return 24;
  if (zoom === 9) return 18;
  return 0;
}

function densityBaseAlphaForZoom(zoom: number) {
  // 전체가 과하게 뿌옇게 되는 걸 방지 (zoom 낮을수록 더 옅게)
  if (zoom <= 6) return 0.12;
  if (zoom === 7) return 0.14;
  if (zoom === 8) return 0.16;
  if (zoom === 9) return 0.18;
  return 0;
}

/**
 * ✅ Density 핵심: scope + "시작 이후 제거(토너먼트 예외)" + "3h+도 약하게 표시"
 * - 시작 이후: 일반 경기는 제거
 * - 토너먼트(tennis tournament 등): 유지, 단 상한을 둬서 과하게 튀지 않게
 *
 * ⚠️ 토너먼트 판별은 프로젝트 데이터 스키마에 맞게 조정 필요:
 *   - 아래는 (e.format === "tournament") 또는 (e.kind === "tournament") 같은 패턴을 지원
 *   - 너 데이터에 맞는 키로 1줄만 바꿔주면 됨
 */
function getDensityWeight(e: Event, scope: TimeScope, now: Date) {
  const start = getEventStart(e);
  if (!start) return 0;

  // ✅ tournament 예외 판별 (프로젝트에 맞게 키를 하나로 통일하면 더 좋음)
  const sport = ((e as any).sport ?? "").toString().toLowerCase();
  const format = ((e as any).format ?? "").toString().toLowerCase();
  const kind = ((e as any).kind ?? "").toString().toLowerCase();
  const isTournament =
    format === "tournament" ||
    kind === "tournament" ||
    (sport === "tennis" && (format === "event" || format === "tourney"));

  // ❌ 시작 이후 제거 (토너먼트 제외)
  if (!isTournament && start.getTime() <= now.getTime()) {
    return 0;
  }

  const diffMs = start.getTime() - now.getTime();
  const diffH = diffMs / (1000 * 60 * 60);

  // ================= TODAY =================
  // 목적: “지금 나갈까?” 판단
  if (scope === "today") {
    if (isTournament) return 0.6;

    // 3h+도 보여야 하니까 0.15~0.3 영역으로 남겨둔다
    if (diffH > 6) return 0.15;
    if (diffH > 3) return 0.30;
    if (diffH > 1) return 0.60;
    if (diffH > 0.25) return 1.00; // 15m~1h
    return 1.20; // 0~15m
  }

  // ================= TOMORROW =================
  // 목적: 내일 어디가 살아있는지 (임박성보다 존재감)
  if (scope === "tomorrow") {
    if (isTournament) return 0.40;
    return 0.35;
  }

  // ================= WEEKEND =================
  // 목적: 도시 단위 선택 (공간 분포)
  if (scope === "weekend") {
    return isTournament ? 0.40 : 0.45;
  }

  // ================= WEEK =================
  // 목적: 다음 7일의 활동 축 (가장 약한 신호)
  return isTournament ? 0.30 : 0.25;
}

export interface HomeEventMapRef {
  surprise: () => void;
  focus: (eventId: string) => void;
  closeSnap: () => void;
  panTo: (latlng: { lat: number; lng: number }) => void;
  resetToAll: () => void;
}

type MarkerBundle = {
  eventId: string;
  status: MarkerStatus;
  main: google.maps.Marker;
  halo?: google.maps.Marker;
};

const HomeEventMap = forwardRef<
  HomeEventMapRef,
  {
    events: Event[];
    onDiscover: (eventId: string) => void;
    children?: React.ReactNode;
    onBoundsChanged?: (bounds: google.maps.LatLngBoundsLiteral) => void;

    // ✅ NEW: scope를 Density 레이어에 주입 (선택)
    // 지금 당장 다른 파일 안 고쳐도 빌드되도록 optional + 기본값 today
    timeScope?: TimeScope;
  }
>(({ events, onDiscover, children, onBoundsChanged, timeScope }, ref) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  const prevViewRef = useRef<{
    center: google.maps.LatLngLiteral;
    zoom: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // replaces markersRef: we need bundles (main + optional halo + presence)
  const markerBundlesRef = useRef<MarkerBundle[]>([]);

  // ❌ HeatmapLayer removed (deprecated May 2026)
  // const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  // ✅ Density overlay refs
  const densityOverlayRef = useRef<google.maps.OverlayView | null>(null);
  const densityEventsRef = useRef<Event[]>([]);
  const densityScopeRef = useRef<TimeScope>("today");
  const densityActiveRef = useRef<boolean>(false);

  const { isLoaded } = useGoogleMaps();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showSnap, setShowSnap] = useState(false);
  const [viewportTick, setViewportTick] = useState(0);
  const [mapActive, setMapActive] = useState(false);
  const ignoreNextBoundsRef = useRef(false);

  // ✅ signal animation phase (0..1)
  const phaseRef = useRef(0);
  const [signalTick, setSignalTick] = useState(0);

  const getZoom = () => mapRef.current?.getZoom?.() ?? 0;

  const shouldUseDensity = () => {
    return !mapActive && getZoom() <= 9;
  };

  const SPORTSIVE_MAP_STYLE: google.maps.MapTypeStyle[] = [
    { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ visibility: "on" }, { color: "#9ca3af" }, { weight: 0.4 }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.stroke",
      stylers: [{ visibility: "on" }, { color: "#ffffff" }, { weight: 3 }],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.fill",
      stylers: [{ visibility: "on" }, { color: "#cbd5e1" }, { weight: 0.3 }],
    },
    {
      featureType: "administrative.country",
      elementType: "labels.text.stroke",
      stylers: [{ visibility: "on" }, { color: "#ffffff" }, { weight: 4 }],
    },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#d9f0e3" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#d1d5db" }, { weight: 0.6 }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f1f5f9" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#e0f2fe" }] },
    { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  ];

  const resetMap = () => {
    if (mapRef.current && prevViewRef.current) {
      mapRef.current.panTo(prevViewRef.current.center);
      mapRef.current.setZoom(prevViewRef.current.zoom);
    }

    prevViewRef.current = null;
    setShowSnap(false);
    setSelectedEvent(null);
    setMapActive(false);
  };

  const UK_CENTER = { lat: 54.5, lng: -3.0 };
  const UK_ZOOM = 7;

  const focusById = (eventId: string) => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    const zoom = mapRef.current.getZoom();

    if (center && typeof zoom === "number") {
      prevViewRef.current = {
        center: { lat: center.lat(), lng: center.lng() },
        zoom,
      };
    }

    const picked = (events as any[]).find((x) => x.id === eventId);
    if (!picked?.location) return;

    setMapActive(true);
    mapRef.current.panTo(picked.location);
    mapRef.current.setZoom(FOCUS_ZOOM);

    setTimeout(() => {
      setSelectedEvent(picked);
      setShowSnap(true);
    }, 350);

    onDiscover(picked.id);
  };

  useImperativeHandle(ref, () => ({
    surprise() {},
    focus(eventId) {
      focusById(eventId);
    },
    closeSnap() {
      resetMap();
    },
    panTo(latlng) {
      if (!mapRef.current) return;
      mapRef.current.panTo(latlng);
      mapRef.current.setZoom(12);
    },
    resetToAll() {
      if (!mapRef.current) return;

      ignoreNextBoundsRef.current = true;

      setMapActive(false);
      setSelectedEvent(null);
      setShowSnap(false);

      mapRef.current.panTo(UK_CENTER);
      mapRef.current.setZoom(UK_ZOOM);
    },
  }));

  useEffect(() => {
    if (!mapRef.current) return;

    const ro = new ResizeObserver(() => {
      google.maps.event.trigger(mapRef.current!, "resize");
    });

    ro.observe(containerRef.current!);
    return () => ro.disconnect();
  }, []);


  // ✅ 1) signal animation (safe): update phase + bump tick every ~900ms
  useEffect(() => {
    const id = window.setInterval(() => {
      phaseRef.current = (phaseRef.current + 0.14) % 1; // slow breathe
      setSignalTick((t) => t + 1);
    }, 900);
    return () => window.clearInterval(id);
  }, []);

  // ✅ 2) Density overlay (Canvas) — replaces HeatmapLayer
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // keep latest refs for overlay.draw()
    densityEventsRef.current = events;
    densityScopeRef.current = (timeScope ?? "today");
    densityActiveRef.current = shouldUseDensity();

    const map = mapRef.current;

    // create overlay once
    if (!densityOverlayRef.current) {
      class DensityOverlay extends google.maps.OverlayView {
        private canvas: HTMLCanvasElement | null = null;
        private ctx: CanvasRenderingContext2D | null = null;

        onAdd() {
          const canvas = document.createElement("canvas");
          canvas.style.position = "absolute";
          canvas.style.top = "0";
          canvas.style.left = "0";
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          canvas.style.pointerEvents = "none";
          canvas.style.zIndex = "2";

          // ✅ 타입 안전: mapRef의 map 사용
          const mapDiv = map.getDiv() as HTMLElement;
          mapDiv.appendChild(canvas);

          this.canvas = canvas;
          this.ctx = canvas.getContext("2d");
        }

        onRemove() {
          if (this.canvas?.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
          }
          this.canvas = null;
          this.ctx = null;
        }

        draw() {
          if (!this.canvas || !this.ctx) return;

          const projection = this.getProjection();
          if (!projection) return;

          const mapDiv = map.getDiv() as HTMLElement;
          const w = mapDiv.clientWidth;
          const h = mapDiv.clientHeight;

          const dpr = window.devicePixelRatio || 1;

          if (
            this.canvas.width !== Math.floor(w * dpr) ||
            this.canvas.height !== Math.floor(h * dpr)
          ) {
            this.canvas.width = Math.floor(w * dpr);
            this.canvas.height = Math.floor(h * dpr);
            this.canvas.style.width = `${w}px`;
            this.canvas.style.height = `${h}px`;
          }

          const ctx = this.ctx;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, w, h);

          if (!densityActiveRef.current) return;

          const zoom = map.getZoom() ?? 0;
          const radius = densityRadiusPxForZoom(zoom);
          const blur = densityBlurPxForZoom(zoom);
          const baseAlpha = densityBaseAlphaForZoom(zoom);

          if (radius <= 0 || baseAlpha <= 0) return;

          const now = new Date();
          const scope = densityScopeRef.current;
          const evs = densityEventsRef.current;

          const color = "15,23,42"; // #0f172a

          for (const e of evs) {
            if (!e.location?.lat || !e.location?.lng) continue;

            const wgt = getDensityWeight(e, scope, now);
            if (wgt <= 0) continue;

            const p = projection.fromLatLngToContainerPixel(
              new google.maps.LatLng(e.location.lat, e.location.lng)
            );
            if (!p) continue;

            const alpha = Math.min(0.52, baseAlpha * wgt);

            ctx.save();
            ctx.beginPath();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `rgba(${color},1)`;
            ctx.shadowColor = `rgba(${color},1)`;
            ctx.shadowBlur = blur;

            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      densityOverlayRef.current = new DensityOverlay();
      densityOverlayRef.current.setMap(map);
    }



    // toggle attach/detach
    if (!densityActiveRef.current) {
      densityOverlayRef.current?.setMap(null);
      return;
    }

    densityOverlayRef.current.setMap(map);
    // force redraw on events/scope updates
    // @ts-ignore
    densityOverlayRef.current.draw?.();
  }, [events, isLoaded, mapActive, viewportTick, timeScope]);

  // ✅ 3) create map once
  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;
    if (mapRef.current) return;

    mapRef.current = new google.maps.Map(containerRef.current, {
      center: UK_CENTER,
      zoom: UK_ZOOM,
      styles: SPORTSIVE_MAP_STYLE,
      clickableIcons: false,
      gestureHandling: "greedy",
      draggable: true,
      zoomControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    });

    mapRef.current.addListener("click", () => {
      if (mapActive) resetMap();
    });
  }, [isLoaded]);

  // ✅ 4) marker bundles create/update (when not density mode)
  useEffect(() => {
    if (!mapRef.current) return;

    // density mode: clear markers
    if (shouldUseDensity()) {
      markerBundlesRef.current.forEach((b) => {
        b.main.setMap(null);
        b.halo?.setMap(null);
      });
      markerBundlesRef.current = [];
      return;
    }

    // clear existing
    markerBundlesRef.current.forEach((b) => {
      b.main.setMap(null);
      b.halo?.setMap(null);
    });
    markerBundlesRef.current = [];

    const z = mapRef.current.getZoom() ?? 12;
    const phase = phaseRef.current;

    const visibleEvents =
      z >= 10 ? thinByGrid(events, z) : events;

    visibleEvents.forEach((e) => {
      if (!e.location) return;

      const status = getMarkerStatus(e);

      const main = new google.maps.Marker({
        position: e.location,
        map: mapRef.current!,
        title: (e as any).title ?? "",
        icon: getMarkerIcon(e, z, phase),
        clickable: true,
        zIndex: status === "LIVE" ? 30 : status === "SOON" ? 20 : 10,
        shape: { type: "circle", coords: [0, 0, 18] },
      });
      main.addListener("click", () => {
        setMapActive(true);
        setSelectedEvent(e);
        setShowSnap(true);
        onDiscover((e as any).id);
        mapRef.current?.panTo(e.location);
        mapRef.current?.setZoom(FOCUS_ZOOM);
      });

      let halo: google.maps.Marker | undefined;
      if (status === "SOON" || status === "LIVE") {
        halo = new google.maps.Marker({
          position: e.location,
          map: mapRef.current!,
          clickable: false,
          icon: getHaloIcon(z, phase),
          zIndex: status === "LIVE" ? 25 : 15,
        });
      }
      // If you want LIVE ring too, uncomment:
      // if (status === "LIVE") { ... }

      markerBundlesRef.current.push({
        eventId: (e as any).id,
        status,
        main,
        halo,
      });
    });
  }, [events, viewportTick, mapActive]);

  // ✅ 5) animate icons without recreating markers (cheap updates)
  useEffect(() => {
    if (!mapRef.current) return;
    if (shouldUseDensity()) return;

    const z = mapRef.current.getZoom() ?? 12;
    const phase = phaseRef.current;

    for (const b of markerBundlesRef.current) {
      // We need event object to compute status; but we stored status at creation-time.
      // Status can change as time passes (SOON->LIVE), so re-evaluate from events list.
      const ev = (events as any[]).find((x) => x.id === b.eventId) as Event | undefined;
      if (!ev) continue;

      const statusNow = getMarkerStatus(ev);
      b.status = statusNow;

      b.main.setIcon(getMarkerIcon(ev, z, phase));
      b.main.setZIndex(statusNow === "LIVE" ? 30 : statusNow === "SOON" ? 20 : 10);

      // Halo: only for SOON
      if (statusNow === "SOON" || statusNow === "LIVE") {
        if (!b.halo) {
          b.halo = new google.maps.Marker({
            position: ev.location!,
            map: mapRef.current!,
            clickable: false,
            icon: getHaloIcon(z, phase),
            zIndex: 15,
          });
        } else {
          b.halo.setIcon(getHaloIcon(z, phase));
          b.halo.setMap(mapRef.current!);
        }
      } else {
        b.halo?.setMap(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signalTick, events]);

  // ✅ 6) idle listener: viewportTick, density↔markers hint, bounds
  const lastDensityRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const listener = mapRef.current.addListener("idle", () => {
      setViewportTick((v) => v + 1);

      const zoom = mapRef.current!.getZoom() ?? 0;

      // zoom out → end active → density mode
      if (zoom <= 9 && mapActive) {
        setMapActive(false);
        setSelectedEvent(null);
        setShowSnap(false);
      }

      // ✅ 히트맵 ↔ 마커 전환 힌트
      const isDensityNow = !mapActive && zoom <= 8;
      if (lastDensityRef.current === null) {
        lastDensityRef.current = isDensityNow;
      } else if (lastDensityRef.current !== isDensityNow) {
        lastDensityRef.current = isDensityNow;
      }

      if (ignoreNextBoundsRef.current) {
        ignoreNextBoundsRef.current = false;
        return;
      }

      const b = mapRef.current!.getBounds();
      if (!b) return;

      onBoundsChanged?.({
        north: b.getNorthEast().lat(),
        east: b.getNorthEast().lng(),
        south: b.getSouthWest().lat(),
        west: b.getSouthWest().lng(),
      });
    });

    return () => listener.remove();
  }, [onBoundsChanged, mapActive]);

  return (
    <div className="fixed inset-0 overflow-visible">
      {/* RADAR OVERLAY */}
      {!shouldUseDensity() && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `
              radial-gradient(
                circle at center,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0) 55%,
                rgba(15,23,42,0.35) 70%,
                rgba(15,23,42,0.55) 100%
              )
            `,
          }}
        />
      )}

      {/* MAP CANVAS */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* OPTIONAL CHILDREN OVER MAP */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-24px)] max-w-3xl">
        {children}
      </div>
      {/* ❌ Removed: "Tap a marker..." */}
    </div>
  );
});

export default HomeEventMap;
