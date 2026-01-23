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
  // slightly larger than before so dots actually read on light basemap
  if (zoom >= 14) return 7.8;
  if (zoom >= 12) return 6.8;
  if (zoom >= 10) return 6.0;
  return 5.4;
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
): google.maps.visualization.WeightedLocation[] {
  // zoom이 낮을수록 더 넓게 퍼짐
  const spreadMeters =
    zoom <= 6 ? 6000 :
    zoom <= 7 ? 3500 :
    zoom <= 8 ? 2000 :
    800;

  // weight이 클수록 점 개수 증가
  const count = Math.round(weight * 4);

  const points: google.maps.visualization.WeightedLocation[] = [];

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
  }
>(({ events, onDiscover, children, onBoundsChanged }, ref) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  const prevViewRef = useRef<{
    center: google.maps.LatLngLiteral;
    zoom: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // replaces markersRef: we need bundles (main + optional halo + presence)
  const markerBundlesRef = useRef<MarkerBundle[]>([]);

  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(
    null
  );

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

  // ✅ 1) signal animation (safe): update phase + bump tick every ~900ms
  useEffect(() => {
    const id = window.setInterval(() => {
      phaseRef.current = (phaseRef.current + 0.14) % 1; // slow breathe
      setSignalTick((t) => t + 1);
    }, 900);
    return () => window.clearInterval(id);
  }, []);

  // ✅ 2) heatmap layer (already there)
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const active = shouldUseDensity();

    if (!active) {
      heatmapRef.current?.setMap(null);
      return;
    }

    const points = buildHeatmapPoints(events);
    const zoom = mapRef.current.getZoom() ?? 0;
    const radius = heatmapRadiusForZoom(zoom);

    if (!heatmapRef.current) {
      heatmapRef.current = new google.maps.visualization.HeatmapLayer({
        data: points,
        map: mapRef.current,
        dissipating: true,
        opacity: 0.68,
        radius,
        gradient: [
          "rgba(0,0,0,0)",
          "rgba(220,252,231,0.35)",  // 아주 연한 연초록
          "rgba(187,247,208,0.5)",   // 연초록
          "rgba(254,240,138,0.6)",   // 노랑
          "rgba(253,224,71,0.7)",    // 진노랑
          "rgba(253,186,116,0.8)",   // 주황
          "rgba(239,68,68,0.9)",     // 빨강
        ],

      });
    } else {
      heatmapRef.current.setData(points);
      heatmapRef.current.set("radius", radius);
      heatmapRef.current.setMap(mapRef.current);
    }
  }, [events, isLoaded, mapActive, viewportTick]);

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
    <div className="fixed inset-0 overflow-hidden">
      {/* RADAR OVERLAY */}
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
