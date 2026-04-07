//src/app/date/[date]/page.tsx

"use client";

import { useState, useMemo, useRef } from "react";
import HomeMapStage from "@/app/ops/components/home/HomeMapStage";
import HomeMapSnapCard from "@/app/ops/components/map-hero/HomeMapSnapCard";
import type { HomeEventMapRef } from "@/app/ops/components/map-hero/HomeEventMap";

function isInBounds(e: any, bounds: any) {
  if (!e.location) return false;

  return (
    e.location.lat <= bounds.north &&
    e.location.lat >= bounds.south &&
    e.location.lng <= bounds.east &&
    e.location.lng >= bounds.west
  );
}

export default function DateClient({ events }: { events: any[] }) {
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [bounds, setBounds] = useState<any>(null);

  const mapRef = useRef<HomeEventMapRef | null>(null);

  const lastMapViewRef = useRef<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);

  const isInteractingRef = useRef(false);
  const isRestoringRef = useRef(false);

  const visibleEvents = useMemo(() => {
    if (!bounds) return events;
    return events.filter((e) => isInBounds(e, bounds));
  }, [events, bounds]);

  return (
    <>
      <button
        onClick={() => setMapOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] bg-black text-white px-4 py-2 rounded-full shadow"
      >
        View map ({events.length})
      </button>
      
      {mapOpen && (
        <div className="fixed inset-0 z-[9999] bg-white">

          <HomeMapStage
            ref={mapRef}
            events={events}
            highlightedId={
              isRestoringRef.current
                ? null
                : hoveredEventId || selectedEvent?.id || null
            }
            onBoundsChanged={(b) => {
              setBounds(b);
              if (isInteractingRef.current) return;
            }}
            onDiscoverFromMap={(id) => {
              const ev = events.find((e) => e.id === id);

              // 🔥 marker 클릭에서도 동일하게 처리
              const current = mapRef.current?.getViewState();
              if (current) {
                lastMapViewRef.current = {
                  center: { ...current.center },
                  zoom: current.zoom,
                };
              }

              isInteractingRef.current = true;

              setSelectedEvent(ev);
              mapRef.current?.focus(id);
            }}
          />

          {selectedEvent && (
            <HomeMapSnapCard
              event={selectedEvent}
              onClose={() => {
                setSelectedEvent(null);

                if (lastMapViewRef.current) {
                  isRestoringRef.current = true;

                  mapRef.current?.restoreViewState(lastMapViewRef.current);
                  lastMapViewRef.current = null;

                  setTimeout(() => {
                    isRestoringRef.current = false;
                    isInteractingRef.current = false;
                  }, 300);
                }
              }}
            />
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-white h-[180px] overflow-y-auto z-20 border-t shadow-lg">
            {visibleEvents.map((e) => {
              const isActive = selectedEvent?.id === e.id;

              return (
                <div
                  key={e.id}
                  className={`p-3 text-sm border-b cursor-pointer transition ${
                    isActive ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                  onMouseEnter={() => setHoveredEventId(String(e.id))}
                  onMouseLeave={() => setHoveredEventId(null)}
                  onClick={() => {
                    const current = mapRef.current?.getViewState();

                    if (current) {
                      lastMapViewRef.current = {
                        center: { ...current.center },
                        zoom: current.zoom,
                      };
                    }

                    isInteractingRef.current = true;

                    setSelectedEvent(e);
                    mapRef.current?.focus(String(e.id));
                  }}
                >
                  <div className="font-medium truncate">
                    {e.homeTeam && e.awayTeam
                      ? `${e.homeTeam} vs ${e.awayTeam}`
                      : e.title}
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-x-2">

                    {/* 1️⃣ 날짜 + 시간 */}
                    {(() => {
                      const raw = e.startDate ?? e.date ?? e.utcDate;
                      if (!raw) return null;

                      const d = new Date(raw);
                      if (isNaN(d.getTime())) return null;

                      return (
                        <span>
                          🕐 {d.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      );
                    })()}

                    {/* 2️⃣ sport + competition */}
                    <span className="truncate max-w-[160px]">
                      · {e.sport && `${e.sport}`} 
                      {(e.league || e.competition) &&
                        ` · ${e.league || e.competition}`}
                    </span>

                    {/* 3️⃣ location */}
                    {e.city && <span> 📍 {e.city}</span>}

                  </div>
                </div>
              );
            })}

            {visibleEvents.length === 0 && (
              <div className="p-4 text-sm text-gray-500 text-center">
                No events in this area
              </div>
            )}
          </div>

          <button
            onClick={() => setMapOpen(false)}
            className="
              absolute 
              bottom-[200px] 
              left-1/2 
              -translate-x-1/2 
              z-[10000] 
              bg-black 
              text-white 
              px-5 
              py-2 
              rounded-full 
              shadow-lg
            "
          >
            Close map
          </button>
        </div>
      )}
    </>
  );
}