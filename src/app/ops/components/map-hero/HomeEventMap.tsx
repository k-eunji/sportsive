// src/app/ops/components/map-hero/HomeEventMap.tsx
"use client";

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { Event } from "@/types";
import { useGoogleMaps } from "@/components/GoogleMapsProvider";
import { getMapVisibility } from "@/lib/eventVisibility";
import { getEventTimeState } from "@/lib/eventTime";

/* =====================
   Constants
===================== */

type MapEvent = Event & {
  __dimmed?: boolean;
};


const FOCUS_ZOOM = 16;
const DEFAULT_ZOOM = 7;
const UK_CENTER = { lat: 54.5, lng: -3.0 };
const ALL_CENTER = { lat: 54.8, lng: -5.5 }; // UK + IE 중앙
const ALL_ZOOM = 6;

const COUNTRY_PRESETS = {
  ALL: {
    center: { lat: 54.8, lng: -5.5 },
    zoom: 6,
  },
  ENGLAND: {
    center: { lat: 52.9, lng: -1.5 },
    zoom: 7,
  },
  SCOTLAND: {
    center: { lat: 56.8, lng: -4.2 },
    zoom: 7,
  },
  WALES: {
    center: { lat: 52.2, lng: -3.8 },
    zoom: 7.5,
  },
  NORTHERN_IRELAND: {
    center: { lat: 54.7, lng: -6.8 },
    zoom: 7.5,
  },
  IRELAND: {
    center: { lat: 53.4, lng: -7.8 },
    zoom: 7,
  },
};


/* =====================
   Marker helpers
===================== */


function markerScaleForZoom(zoom: number) {
  if (zoom >= 14) return 5;
  if (zoom >= 12) return 5.8;
  if (zoom >= 10) return 6.4;
  return 6.5;
}

function getMarkerIcon(
  _e: Event,
  zoom: number
): google.maps.Symbol {
  const baseScale = markerScaleForZoom(zoom);

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: baseScale,
    fillColor: "#0f172a",
    fillOpacity: 0.85,
    strokeColor: "#ffffff",
    strokeOpacity: 0.9,
    strokeWeight: 2,
  };
}

/* =====================
   Ref API
===================== */
export type CountryKey =
  | "ALL"
  | "ENGLAND"
  | "SCOTLAND"
  | "WALES"
  | "NORTHERN_IRELAND"
  | "IRELAND";

export interface HomeEventMapRef {
  focus: (eventId: string) => void;
  resetToAll: () => void;
  panTo: (latlng: { lat: number; lng: number }) => void;
  fitBounds: (bounds: google.maps.LatLngBoundsLiteral) => void;
  panToCountry: (key: CountryKey) => void;

  // ✅ 추가
  getViewState: () => {
    center: { lat: number; lng: number };
    zoom: number;
  } | null;

  restoreViewState: (state: {
    center: { lat: number; lng: number };
    zoom: number;
  }) => void;
}

/* =====================
   Component
===================== */

const HomeEventMap = forwardRef<
  HomeEventMapRef,
  {
    events: MapEvent[];
    highlightedId?: string | null;
    onDiscover: (eventId: string) => void;
    onBoundsChanged?: (
      bounds: google.maps.LatLngBoundsLiteral
    ) => void;
    mapStyleOverride?: google.maps.MapTypeStyle[];
  }
>(function HomeEventMap(
  {
    events,
    onDiscover,
    highlightedId,  
    onBoundsChanged,
    mapStyleOverride,
  },
  ref
) {
  const { isLoaded } = useGoogleMaps();

  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const anchorMarkerRef = useRef<google.maps.Marker | null>(null);
  

  /* =====================
     Imperative API
  ===================== */

  const focusById = (eventId: string) => {
    if (!mapRef.current) return;

    const ev = events.find((e: any) => e.id === eventId);
    if (!ev?.location) return;

    mapRef.current.panTo(ev.location);
    mapRef.current.setZoom(FOCUS_ZOOM);
  };

  useImperativeHandle(ref, () => ({
    focus: focusById,

    panTo(latlng) {
      if (!mapRef.current) return;

      mapRef.current.panTo(latlng);
      mapRef.current.setZoom(12);

      if (!anchorMarkerRef.current) {
        anchorMarkerRef.current = new google.maps.Marker({
          map: mapRef.current,
          position: latlng,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#2563eb",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
          zIndex: 100,
        });
      } else {
        anchorMarkerRef.current.setPosition(latlng);
      }
    },


    panToCountry(key) {
      if (!mapRef.current) return;
      const preset = COUNTRY_PRESETS[key];
      if (!preset) return;

      mapRef.current.panTo(preset.center);
      mapRef.current.setZoom(preset.zoom);
    },

    fitBounds(bounds) {
      if (!mapRef.current) return;

      const gBounds = new google.maps.LatLngBounds(
        { lat: bounds.south, lng: bounds.west },
        { lat: bounds.north, lng: bounds.east }
      );

      mapRef.current.fitBounds(gBounds);
    },

    resetToAll() {
      if (!mapRef.current) return;
      mapRef.current.panTo(COUNTRY_PRESETS.ALL.center);
      mapRef.current.setZoom(COUNTRY_PRESETS.ALL.zoom);
    },

    // ✅ 추가
    getViewState() {
      if (!mapRef.current) return null;
      const c = mapRef.current.getCenter();
      if (!c) return null;

      return {
        center: { lat: c.lat(), lng: c.lng() },
        zoom: mapRef.current.getZoom() ?? DEFAULT_ZOOM,
      };
    },

    restoreViewState(state) {
      if (!mapRef.current) return;
      mapRef.current.panTo(state.center);
      mapRef.current.setZoom(state.zoom);
    },
  }));

  /* =====================
     Create map (once)
  ===================== */

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;
    if (mapRef.current) return;

    mapRef.current = new google.maps.Map(
      containerRef.current,
      {
        center: UK_CENTER,
        zoom: DEFAULT_ZOOM,
        styles: mapStyleOverride,
        clickableIcons: false,
        gestureHandling: "greedy",
        zoomControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
      }
    );

    let lastBoundsKey = "";

    mapRef.current.addListener("idle", () => {
      const b = mapRef.current!.getBounds();
      if (!b) return;

      const next = {
        north: b.getNorthEast().lat(),
        east: b.getNorthEast().lng(),
        south: b.getSouthWest().lat(),
        west: b.getSouthWest().lng(),
      };

      const key = JSON.stringify(next);

      if (key === lastBoundsKey) return; // 🔥 변화 없으면 무시

      lastBoundsKey = key;
      onBoundsChanged?.(next);
    });

  }, [isLoaded, mapStyleOverride, onBoundsChanged]);

  /* =====================
     Markers (no density, no heat)
  ===================== */

  useEffect(() => {
    if (!mapRef.current) return;

    // clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const zoom = mapRef.current.getZoom() ?? 12;

    for (const e of events) {
      const isHighlighted =
        highlightedId &&
        String(e.id) === highlightedId;

      if (!e.location) continue;

      const visibility = getMapVisibility(e);
      if (visibility === "HIDDEN") continue;

      const timeState = getEventTimeState(e);

      // 🔹 이미 시작했거나 끝난 이벤트
      const isPastOrLive =
        timeState === "LIVE" ||
        timeState === "ENDED";

      const baseIcon = getMarkerIcon(e, zoom);

      const marker = new google.maps.Marker({
        position: e.location,
        map: mapRef.current,
        icon: isHighlighted
          ? {
              ...baseIcon,
              scale: markerScaleForZoom(zoom) + 2,
              fillColor: "#ef4444",
            }
          : isPastOrLive
          ? {
              ...baseIcon,
              fillColor: "#9ca3af", // 회색
              strokeColor: "#e5e7eb",
            }
          : baseIcon,

        opacity: isPastOrLive ? 0.75 : 1,

        zIndex: isHighlighted ? 50 : 10,
      });
      marker.addListener("click", () => {
        onDiscover((e as any).id);
        focusById((e as any).id);
      });

      markersRef.current.push(marker);
    }
  }, [events, highlightedId]);

  /* =====================
     Render
  ===================== */

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="absolute inset-0"
      />
    </div>
  );

});

export default HomeEventMap;
