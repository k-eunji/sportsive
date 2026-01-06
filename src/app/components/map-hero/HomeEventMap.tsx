// src/app/components/map-hero/HomeEventMap.tsx

'use client';

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import type { Event } from '@/types';
import { useGoogleMaps } from '@/components/GoogleMapsProvider';
import HomeMapSnapCard from './HomeMapSnapCard';

const DEFAULT_LOCATION = { lat: 51.5074, lng: -0.1278 };
const DEFAULT_ZOOM = 8;
const FOCUS_ZOOM = 13;

export interface HomeEventMapRef {
  surprise: () => void;
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
  const markersRef =
    useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const { isLoaded } = useGoogleMaps();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapActive, setMapActive] = useState(false); // ⭐ 핵심

  const resetMap = () => {
    setSelectedEvent(null);
    setMapActive(false);
    mapRef.current?.panTo(DEFAULT_LOCATION);
    mapRef.current?.setZoom(DEFAULT_ZOOM);
  };

  // 🎲 Surprise API
  useImperativeHandle(ref, () => ({
    surprise() {
      if (!mapRef.current) return;

      setMapActive(true);

      const bounds = mapRef.current.getBounds();
      if (!bounds) return;

      const visible = events.filter((e) => {
        if (!e.location) return false;
        return bounds.contains(
          new google.maps.LatLng(e.location.lat, e.location.lng)
        );
      });

      if (!visible.length) return;

      const picked =
        visible[Math.floor(Math.random() * visible.length)];

      setSelectedEvent(picked);
      onDiscover(picked.id);

      mapRef.current.panTo(picked.location!);
      mapRef.current.setZoom(FOCUS_ZOOM);
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

        // ⭐ 모바일 UX 핵심 옵션
        gestureHandling: mapActive ? 'greedy' : 'none',
        draggable: mapActive,
      });

      mapRef.current.addListener('click', () => {
        if (mapActive) resetMap();
      });
    } else {
      // 상태 변경 시 옵션 업데이트
      mapRef.current.setOptions({
        gestureHandling: mapActive ? 'greedy' : 'none',
        draggable: mapActive,
      });
    }

    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    events.forEach((e) => {
      if (!e.location) return;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: e.location,
        map: mapRef.current!,
        title: e.title,
      });

      marker.addListener('click', () => {
        setMapActive(true);
        setSelectedEvent(e);
        onDiscover(e.id);
        mapRef.current?.panTo(e.location!);
        mapRef.current?.setZoom(FOCUS_ZOOM);
      });

      markersRef.current.push(marker);
    });
  }, [isLoaded, events, mapActive]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border">
      {/* 지도 */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* 🔮 Tomorrow Tease overlay slot */}
      <div
        className="
          absolute top-3 left-1/2 -translate-x-1/2
          z-20
          w-[calc(100%-24px)]
          max-w-3xl
        "
      >
        {/* 여기에 TomorrowTease가 들어옴 */}
        {/** children **/}
      </div>

      {!mapActive && (
        <button
          onClick={() => setMapActive(true)}
          className="
            absolute inset-0 z-10
            flex items-center justify-center
            bg-black/10 backdrop-blur-[1px]
            text-sm font-medium text-gray-900
          "
        >
          Tap to explore the map
        </button>
      )}

      {selectedEvent && (
        <HomeMapSnapCard event={selectedEvent} onClose={resetMap} />
      )}
    </div>
  );

});

export default HomeEventMap;
