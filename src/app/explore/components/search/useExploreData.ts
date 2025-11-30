//src/app/explore/hooks/useExploreData.ts

"use client";

import { useEffect, useState } from "react";

export function useExploreData(query: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 1) 유저 위치 불러오기
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // fallback: London
        setLocation({ lat: 51.5074, lng: -0.1278 });
      }
    );
  }, []);

  // 2) Explore API 호출
  useEffect(() => {
    if (!location) return;

    const load = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/explore", window.location.origin);
        if (query) url.searchParams.set("q", query);
        url.searchParams.set("lat", String(location.lat));
        url.searchParams.set("lng", String(location.lng));

        const res = await fetch(url.toString());
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [location, query]);

  return { loading, data };
}
