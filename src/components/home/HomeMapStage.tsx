// src/app/components/home/HomeMapStage.tsx
"use client";

import { forwardRef } from "react";
import type { Event } from "@/types";
import type { TimeScope } from "@/lib/nowDashboard";
import HomeEventMap, { HomeEventMapRef } from "@/app/components/map-hero/HomeEventMap";

type Props = {
  events: Event[];
  timeScope: TimeScope;
  onDiscoverFromMap: (eventId: string) => void;
  onBoundsChanged?: (bounds: google.maps.LatLngBoundsLiteral) => void;
};

const HomeMapStage = forwardRef<HomeEventMapRef, Props>(
  function HomeMapStage(
    { events, timeScope, onDiscoverFromMap, onBoundsChanged }, // ✅ 여기!
    ref
  ) {
    return (
      <HomeEventMap
        ref={ref}
        events={events}
        timeScope={timeScope}          // ✅ 정상
        onDiscover={onDiscoverFromMap}
        onBoundsChanged={onBoundsChanged}
      />
    );
  }
);

export default HomeMapStage;
