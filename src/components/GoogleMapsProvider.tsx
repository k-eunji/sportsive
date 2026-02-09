// src/components/GoogleMapsProvider.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";

const GoogleMapsContext = createContext({ isLoaded: false });

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}

declare global {
  interface Window {
    initGoogleMaps: () => void;
  }
}

export default function GoogleMapsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if ((window as any).google?.maps?.importLibrary) {
      setIsLoaded(true);
      return;
    }

    window.initGoogleMaps = async () => {
      const google = (window as any).google;

      // ✅ 여기서만 importLibrary 호출 가능
      await google.maps.importLibrary("maps");
      await google.maps.importLibrary("places");
      await google.maps.importLibrary("marker");
      // ❌ HeatmapLayer(visualization) 제거 (May 2026 unavailable)
      // await google.maps.importLibrary("visualization");

      setIsLoaded(true);
    };

    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js` +
      `?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}` +
      `&libraries=places` +
      `&v=beta` +
      `&loading=async` +
      `&callback=initGoogleMaps`;

    script.async = true;
    script.defer = true;

    document.head.appendChild(script);
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
