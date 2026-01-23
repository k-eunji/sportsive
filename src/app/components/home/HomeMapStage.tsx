// src/app/components/home/HomeMapStage.tsx
"use client";

import { forwardRef } from "react";
import type { Event } from "@/types";
import HomeEventMap, { HomeEventMapRef } from "@/app/components/map-hero/HomeEventMap";

type Props = {
  events: Event[];
  onDiscoverFromMap: (eventId: string) => void;
  onBoundsChanged?: (bounds: google.maps.LatLngBoundsLiteral) => void;
};
const HomeMapStage = forwardRef<HomeEventMapRef, Props>(
  function HomeMapStage(
    { events, onDiscoverFromMap, onBoundsChanged }, // ✅ 여기 추가
    ref
  ) {
    return (
      <HomeEventMap
        ref={ref}
        events={events}
        onDiscover={onDiscoverFromMap}
        onBoundsChanged={onBoundsChanged} // ✅ 이제 정상
      />
    );
  }
);

export default HomeMapStage;
