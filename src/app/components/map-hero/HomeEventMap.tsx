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
import HomeMapSnapCard from "./HomeMapSnapCard";

const DEFAULT_LOCATION = { lat: 51.5074, lng: -0.1278 };
const DEFAULT_ZOOM = 8;
const FOCUS_ZOOM = 13;

export interface HomeEventMapRef {
  surprise: () => void;
  focus: (eventId: string) => void;
}

const HomeEventMap = forwardRef<
  HomeEventMapRef,
  {
    events: Event[];
    onDiscover: (eventId: string) => void;
    children?: React.ReactNode;
  }
>(({ events, onDiscover, children }, ref) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const { isLoaded } = useGoogleMaps();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showSnap, setShowSnap] = useState(false);

  const [mapActive, setMapActive] = useState(false);

  const resetMap = () => {
    setSelectedEvent(null);
    setMapActive(false);
    mapRef.current?.panTo(DEFAULT_LOCATION);
    mapRef.current?.setZoom(DEFAULT_ZOOM);
  };

  const focusById = (eventId: string) => {
    if (!mapRef.current) return;
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

    mapRef.current.panTo(picked.location);
    mapRef.current.setZoom(FOCUS_ZOOM);
  };

  useImperativeHandle(ref, () => ({
    surprise() {
      if (!mapRef.current) return;

      setMapActive(true);

      const bounds = mapRef.current.getBounds();
      if (!bounds) return;

      const visible = (events as any[]).filter((e) => {
        if (!e.location) return false;
        return bounds.contains(
          new google.maps.LatLng(e.location.lat, e.location.lng)
        );
      });

      if (!visible.length) return;

      const picked = visible[Math.floor(Math.random() * visible.length)];
      if (!picked?.location) return;

      mapRef.current.panTo(picked.location);
      mapRef.current.setZoom(FOCUS_ZOOM);

      // ⭐ 핵심
      setTimeout(() => {
        setSelectedEvent(picked);
        setShowSnap(true);
      }, 350);

      onDiscover(picked.id);
    },
    focus(eventId: string) {
      focusById(eventId);
    },
  }));

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(containerRef.current, {
        center: DEFAULT_LOCATION,
        zoom: DEFAULT_ZOOM,
        clickableIcons: false,
        mapId: process.env.NEXT_PUBLIC_MAP_ID_WEB,

        // 모바일 스크롤 충돌 완화:
        // 기본은 cooperative (스크롤 우선), 활성화될 때만 greedy
        gestureHandling: mapActive ? "greedy" : "cooperative",
        draggable: true,
      });

      mapRef.current.addListener("click", () => {
        if (mapActive) resetMap();
      });
    } else {
      mapRef.current.setOptions({
        gestureHandling: mapActive ? "greedy" : "cooperative",
        draggable: true,
      });
    }

    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    (events as any[]).forEach((e) => {
      if (!e.location) return;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: e.location,
        map: mapRef.current!,
        title: e.title,
      });

      marker.addListener("click", () => {
        setMapActive(true);
        setSelectedEvent(e);
        onDiscover(e.id);
        mapRef.current?.panTo(e.location);
        mapRef.current?.setZoom(FOCUS_ZOOM);
      });

      markersRef.current.push(marker);
    });
  }, [isLoaded, events, mapActive]);

  return (
    <div className="relative w-full h-[60vh] max-h-[520px] min-h-[420px] rounded-2xl overflow-hidden border">
      <div ref={containerRef} className="absolute inset-0" />

      <div
        className="
          absolute top-3 left-1/2 -translate-x-1/2
          z-20 w-[calc(100%-24px)] max-w-3xl
        "
      >
        {children}
      </div>

      {!mapActive && (
        <div
          className="
            absolute bottom-3 left-1/2 -translate-x-1/2
            z-10 rounded-full
            bg-black/55 text-white
            text-xs px-3 py-1.5
            pointer-events-none
          "
        >
          Drag anywhere. Tap a pin. Or hit Surprise.
        </div>
      )}

      {showSnap && selectedEvent && (
        <HomeMapSnapCard event={selectedEvent} onClose={resetMap} />
      )}

    </div>
  );
});

export default HomeEventMap;
