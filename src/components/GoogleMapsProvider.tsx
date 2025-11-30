//src/components/GoogleMapsProvider.tsx

"use client";

import { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const GoogleMapsContext = createContext({ isLoaded: false });

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}

// ✔ TS가 허용하는 라이브러리 목록 재정의
type GoogleMapsLibrary = "places" | "marker";

const MAP_LIBRARIES: GoogleMapsLibrary[] = ["places", "marker"];

export default function GoogleMapsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded } = useJsApiLoader({
    id: "google-maps-loader",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: MAP_LIBRARIES,
    language: "en-GB",
    region: "GB",
    version: "weekly",
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
