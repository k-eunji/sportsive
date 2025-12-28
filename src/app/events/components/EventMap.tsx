// src/app/events/components/EventMap.tsx

'use client';

import React, { useRef, useEffect, useState } from 'react';
import type { Event } from '@/types';
import { formatEventTimeWithOffsetUTC } from '@/utils/date';
import { useGoogleMaps } from '@/components/GoogleMapsProvider';
import MapSnapCard from './MapSnapCard';

const MAP_ID_WEB = process.env.NEXT_PUBLIC_MAP_ID_WEB ?? '';

interface Props {
  events: Event[];
  filteredEvents: Event[];
  setFilteredEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  selectedEvent: Event | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<Event | null>>;
  selectedCity?: string;
  selectedRegion?: string;
  userLocation?: { lat: number; lng: number };
}

export default function EventMap({
  events,
  filteredEvents,
  setFilteredEvents,
  selectedEvent,
  setSelectedEvent,
  selectedCity,
  selectedRegion,
}: Props) {
  const DEFAULT_LOCATION = { lat: 51.5074, lng: -0.1278 };
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { isLoaded } = useGoogleMaps();

  const markersRef = useRef<any[]>([]);
  const currentMarkerRef = useRef<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isUserCentered, setIsUserCentered] = useState(false);

  const supportsAdvancedMarker = React.useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      (window as any).google?.maps?.marker?.AdvancedMarkerElement
    );
  }, [isLoaded]);

  /** -------- InfoWindow HTML -------- */
  const createEventInfoWindowContent = (e: Event) => {
    const eventDate = new Date(e.date);
    const now = new Date();
    const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    const canCreateMeetup = daysDiff <= 7 && daysDiff > 0;
    const isLiveDay = now.toDateString() === eventDate.toDateString();

    const buttonStyle =
      'display:inline-block;padding:2px 6px;font-size:10px;font-weight:bold;border-radius:6px;text-decoration:none;color:white;cursor:pointer;';

    return `
      <div style="font-family:sans-serif;color:#111;display:flex;flex-direction:column;gap:4px;">
        ...
      </div>
    `;
  };

  const createMarker = (options: any) => {
    if (supportsAdvancedMarker) {
      return new google.maps.marker.AdvancedMarkerElement(options);
    }
    return new google.maps.Marker(options);
  };

  const showCurrentMarker = (loc: { lat: number; lng: number }) => {
    if (!mapRef.current) return;
    if (currentMarkerRef.current) {
      currentMarkerRef.current.setMap?.(null);
    }

    const marker = createMarker({
      position: loc,
      map: mapRef.current,
      title: 'You are here',
      content: supportsAdvancedMarker
        ? (() => {
            const icon = document.createElement('div');
            icon.textContent = '📍';
            icon.style.fontSize = '24px';
            return icon;
          })()
        : undefined
    });

    currentMarkerRef.current = marker;

  };

  const getEventsNearLocation = (loc: { lat: number; lng: number }, radiusKm = 50) => {
    return filteredEvents.filter((e) => {
      if (!e.location) return false;
      const R = 6371;
      const dLat = ((e.location.lat - loc.lat) * Math.PI) / 180;
      const dLng = ((e.location.lng - loc.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((loc.lat * Math.PI) / 180) *
          Math.cos((e.location.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c <= radiusKm;
    });
  };

  const renderMarkers = (center?: { lat: number; lng: number }) => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap?.(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    if (center) {
      showCurrentMarker(center);
      bounds.extend(center);
    }

    const targetEvents = center ? getEventsNearLocation(center) : filteredEvents;

    targetEvents.forEach((e) => {
      if (!e.location) return;

      const marker = createMarker({
        position: e.location,
        map: mapRef.current!,
        title: e.title,
        content: supportsAdvancedMarker
          ? (() => {
              const div = document.createElement('div');
              div.style.cssText =
                'width:20px;height:20px;background:#ef4444;border-radius:50%;border:2px solid white;';
              return div;
            })()
          : undefined
      });

      const info = new google.maps.InfoWindow({
        content: createEventInfoWindowContent(e),
        maxWidth: 220,
      });

      marker.addListener('click', () => {
        info.open(mapRef.current, marker);
        setSelectedEvent(e);
      });

      markersRef.current.push(marker);
      bounds.extend(e.location);
    });

    if (!bounds.isEmpty() && !isUserCentered && !selectedEvent) {
      mapRef.current.fitBounds(bounds);
    }

  };

  useEffect(() => {
    if (currentLocation && mapRef.current) renderMarkers(currentLocation);
  }, [currentLocation, filteredEvents]);

  useEffect(() => {
    if (!mapRef.current) return;

    const geocoder = new google.maps.Geocoder();

    if ((selectedRegion || selectedCity) && !isUserCentered) {
      geocoder.geocode({ address: selectedCity ?? selectedRegion }, (results, status) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          const newCenter = { lat: loc.lat(), lng: loc.lng() };
          setCurrentLocation(newCenter);
          renderMarkers(newCenter);
          mapRef.current?.panTo(newCenter);
          mapRef.current?.setZoom(10);
        }
      });
    }
  }, [selectedRegion, selectedCity, isUserCentered]);

  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: currentLocation ?? DEFAULT_LOCATION,
        zoom: 8,
        mapId: MAP_ID_WEB,
        clickableIcons: true,
      });
    }

    renderMarkers(currentLocation ?? undefined);
  }, [isLoaded, currentLocation, filteredEvents]);

  useEffect(() => {
    if (!mapRef.current || !selectedEvent?.location) return;

    const loc = selectedEvent.location;
    mapRef.current.setCenter(loc);
    mapRef.current.setZoom(15);

    const info = new google.maps.InfoWindow({
      content: createEventInfoWindowContent(selectedEvent),
      maxWidth: 220,
    });

    const marker = createMarker({
      position: loc,
      map: mapRef.current,
      title: selectedEvent.title,
    });

    marker.addListener('click', () => info.open(mapRef.current, marker));
    markersRef.current.forEach((m) => m.setMap?.(null));
    markersRef.current = [marker];
  }, [selectedEvent]);

  return (
    <div className="relative flex flex-col gap-3">
      {/* 상단 카운트 */}
      <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
        {events.length} match{events.length === 1 ? '' : 'es'}
      </p>

      {/* 지도 + 카드 레이어 */}
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden">
        {/* 📍 지도 */}
        <div
          ref={mapContainerRef}
          className="absolute inset-0"
        />

        {/* 📍 현재 위치 버튼 */}
        <button
          type="button"
          onClick={() => {
            if (!navigator.geolocation) {
              alert('Geolocation not supported');
              return;
            }

            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const loc = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                };

                setIsUserCentered(true);
                setCurrentLocation(loc);

                // ✅ 핵심: 선택된 경기 카드 닫기
                setSelectedEvent(null);

                // London 전체 경기 다시 보여주기
                setFilteredEvents(events);

                mapRef.current?.panTo(loc);
                mapRef.current?.setZoom(11);
              },
              () => alert('Location access denied')
            );

          }}
          className="absolute top-3 right-3 z-20 text-xl bg-white dark:bg-gray-800 p-2 rounded-full shadow"
          aria-label="Center map on your location"
        >
          📍
        </button>

        {/* 🧾 지도 위에 뜨는 경기 카드 */}
        {selectedEvent && (
          <MapSnapCard
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </div>
  );

}
