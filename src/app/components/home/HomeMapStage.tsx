//src/app/components/home/HomeMapStage.tsx

"use client";

import { useEffect, useRef } from "react";
import type { Event } from "@/types";
import HomeEventMap, { HomeEventMapRef } from "@/app/components/map-hero/HomeEventMap";
import SoftButton from "@/components/ui/SoftButton";
import { track } from "@/lib/track";

export default function HomeMapStage({
  events,
  focusEventId,
  autoSurprise = false,
  onClose,
  onSurprise,
  onDiscoverFromMap,
}: {
  events: Event[];
  focusEventId: string | null;
  autoSurprise?: boolean;
  onClose: () => void;
  onSurprise: () => void;
  onDiscoverFromMap: (eventId: string) => void;
}) {
  const mapRef = useRef<HomeEventMapRef | null>(null);

  useEffect(() => {
    if (!focusEventId) return;
    mapRef.current?.focus?.(focusEventId);
  }, [focusEventId]);

  useEffect(() => {
    if (!autoSurprise) return;

    const t = setTimeout(() => {
      mapRef.current?.surprise();
    }, 400); // ⬅️ 늘려라

    return () => clearTimeout(t);
  }, [autoSurprise]);

  return (
    <section className="px-6">
      <div className="md:max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Map</p>
            <p className="text-xs text-muted-foreground truncate">
              Drag, tap, or hit Surprise — it will surface something nearby.
            </p>


          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SoftButton
              as="button"
              onClick={() => {
                track("surprise_clicked", { source: "map_stage" });
                mapRef.current?.surprise();
                onSurprise();
              }}
              className="px-4 py-2"
            >
              Surprise →
            </SoftButton>

            <button
              onClick={() => {
                track("map_closed");
                onClose();
              }}
              className="text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>

        <HomeEventMap ref={mapRef} events={events} onDiscover={onDiscoverFromMap} />
      </div>
    </section>
  );
}
