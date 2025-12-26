// src/app/events/components/EventMap.tsx

'use client';

import React, { useRef, useEffect, useState } from 'react';
import type { Event } from '@/types';
import { formatEventTimeWithOffsetUTC } from '@/utils/date';
import { useGoogleMaps } from '@/components/GoogleMapsProvider';

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

    if (!bounds.isEmpty() && !isUserCentered) {
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
      <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base">
        {events.length} event{events.length === 1 ? '' : 's'}
      </p>

      <button
        type="button"
        onClick={() => {
          if (!navigator.geolocation) return alert('Geolocation not supported');
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setIsUserCentered(true);
              setCurrentLocation(loc);
              const nearby = getEventsNearLocation(loc, 50);
              setFilteredEvents(nearby);
              mapRef.current?.panTo(loc);
              mapRef.current?.setZoom(13);
            },
            () => alert('Location access denied')
          );
        }}
        className="absolute top-2 right-2 z-10 text-2xl text-blue-600 bg-white dark:bg-gray-800 p-2 rounded-full shadow"
      >
        📍
      </button>

      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '500px',
          borderRadius: '16px',
        }}
      />

      
    </div>
  );
}
