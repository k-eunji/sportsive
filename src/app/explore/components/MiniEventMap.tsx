// src/app/explore/components/MiniEventMap.tsx

"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import { useEffect } from "react";
import { useGoogleMaps } from "@/components/GoogleMapsProvider";

interface MiniEventMapProps {
  events: Array<{
    id: string | number;
    location: { lat: number; lng: number };
  }>;
  center: { lat: number; lng: number };
}

export default function MiniEventMap({ events, center }: MiniEventMapProps) {
  const { isLoaded } = useGoogleMaps();

  // 🔍 DEBUG 1: Provider 로딩 상태 확인
  useEffect(() => {
    console.log("🧪 MiniEventMap mounted");
    console.log("🧪 isLoaded from provider:", isLoaded);
    console.log("🧪 window.google:", typeof window !== "undefined" ? (window as any).google : null);
    console.log("🧪 events:", events);
    console.log("🧪 center:", center);
  }, [isLoaded]);

  // 🔍 DEBUG 2: Safari에서 resize 이벤트가 필요한 경우가 있어 강제로 발생
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        console.log("🧪 Safari resize event dispatched");
      }, 300);
    }
  }, [isLoaded]);

  // 👇 Google Maps API 준비 전에는 skeleton
  if (!isLoaded || typeof window === "undefined" || !(window as any).google?.maps) {
    console.log("🧪 Skeleton shown: Google Maps is not ready");
    return (
      <div className="w-full h-[220px] rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  console.log("🧪 Google Maps is fully ready — rendering map!");

  return (
    <div
      className="w-full h-[220px] rounded-xl border border-gray-300 dark:border-gray-700 relative"
      style={{
        overflow: "hidden",      // Safari fix
        WebkitMaskImage: "none", // Safari rendering fix
        position: "relative",
      }}
    >
      <GoogleMap
        center={center}
        zoom={10}
        // 🔍 DEBUG 3: GoogleMap load check
        onLoad={() => {
          console.log("🧪 GoogleMap component mounted (Safari)");
        }}
        mapContainerStyle={{
          width: "100%",
          height: "100%",
          borderRadius: "12px",
        }}
        options={{
          disableDefaultUI: true,
          gestureHandling: "cooperative",
          clickableIcons: false,
        }}
      >
        {events.map((e) => (
          <Marker
            key={e.id}
            position={e.location}
            onLoad={() => console.log("🧪 Marker loaded:", e.id)} // 🔍 DEBUG 4
            onClick={() => (window.location.href = `/events/${e.id}`)}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
