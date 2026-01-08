//src/app/components/home/useGeoContext.ts

"use client";

import { useEffect, useState } from "react";

export function useGeoContext(pos: { lat: number; lng: number } | null) {
  const [geo, setGeo] = useState<{ city: string | null; region: string | null }>({
    city: null,
    region: null,
  });

  useEffect(() => {
    if (!pos) return;

    fetch(`/api/geo/resolve?lat=${pos.lat}&lng=${pos.lng}`)
      .then((r) => r.json())
      .then(setGeo)
      .catch(() => setGeo({ city: null, region: null }));
  }, [pos]);

  return geo;
}
