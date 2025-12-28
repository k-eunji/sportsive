//src/app/components/map-hero/HomeEventMap.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import type { Event } from '@/types';
import { useGoogleMaps } from '@/components/GoogleMapsProvider';
import HomeMapSnapCard from './HomeMapSnapCard';

const DEFAULT_LOCATION = { lat: 51.5074, lng: -0.1278 };
const DEFAULT_ZOOM = 8;
const FOCUS_ZOOM = 13;

export default function HomeEventMap({ events }: { events: Event[] }) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const defaultCenterRef = useRef(DEFAULT_LOCATION);

  const { isLoaded } = useGoogleMaps();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  /** 🔁 전체 지도 상태로 복원 */
  const resetMap = () => {
    setSelectedEvent(null);
    mapRef.current?.panTo(defaultCenterRef.current);
    mapRef.current?.setZoom(DEFAULT_ZOOM);
  };

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(containerRef.current, {
        center: DEFAULT_LOCATION,
        zoom: DEFAULT_ZOOM,
        clickableIcons: false,
        mapId: process.env.NEXT_PUBLIC_MAP_ID_WEB,
      });

      // 🟢 지도 빈 공간 클릭 시 전체로 복귀
      mapRef.current.addListener('click', resetMap);
    }

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 마커 다시 그림
    events.forEach((e) => {
      if (!e.location) return;

      const marker = new google.maps.Marker({
        position: e.location,
        map: mapRef.current!,
        title: e.title,
      });

      marker.addListener('click', () => {
        setSelectedEvent(e);
        mapRef.current?.panTo(e.location!);
        mapRef.current?.setZoom(FOCUS_ZOOM);
      });

      markersRef.current.push(marker);
    });
  }, [isLoaded, events]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border">
      <div ref={containerRef} className="absolute inset-0" />

      {selectedEvent && (
        <HomeMapSnapCard
          event={selectedEvent}
          onClose={resetMap}
        />
      )}
    </div>
  );
}
