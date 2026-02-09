// src/app/ops/components/home/LocationSheet.tsx
"use client";

import { useMemo, useState } from "react";

export default function LocationSheet({
  regions,
  cities,
  observerRegion,
  onPickRegion,
  onPickCity,
  onClose,
  onSetAnchor,              // 🔥 추가
}: {
  regions: { key: string; label: string }[]
  onPickRegion: (key: string | null) => void
  cities: string[];
  observerRegion: string | null;
  onPickCity: (c: string) => void;
  onClose: () => void;
  onSetAnchor: () => void;  // 🔥 추가
}) {

  const [query, setQuery] = useState("");

  const filteredCities = useMemo(() => {
    if (!query) return cities;
    return cities.filter((c) =>
      c.toLowerCase().includes(query.toLowerCase())
    );
  }, [cities, query]);

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
      />

      {/* sheet */}
      <div
        className="
          absolute bottom-0 left-0 right-0
          bg-background
          rounded-t-2xl
          px-4 pt-3 pb-[env(safe-area-inset-bottom)]
          max-h-[70svh]
          overflow-y-auto
        "
      >
        {/* handle + close */}
        <div className="relative flex items-center justify-center mb-3">
          <div className="h-1.5 w-10 rounded-full bg-border/60" />
          <button
            onClick={onClose}
            className="absolute right-0 text-sm text-muted-foreground"
            aria-label="Close sheet"
          >
            ✕
          </button>
        </div>

        {/* title */}
        <p className="text-sm font-semibold mb-3">Event footprint</p>

        {/* REGION – compact, progressive */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          <button
            onClick={() => onPickRegion(null)}
            className={[
              "shrink-0 px-3 py-1.5 rounded-full text-sm border",
              observerRegion === null
                ? "bg-black text-white border-black"
                : "border-border/60",
            ].join(" ")}
          >
              Portfolio-wide
            </button>

          {regions.map(({ key, label }) => {
            const active = key === observerRegion;

            return (
              <button
                key={key}
                onClick={() => onPickRegion(key)}   // 🔥 key만 넘김
                className={[
                  "shrink-0 px-3 py-1.5 rounded-full text-sm border",
                  active
                    ? "bg-black text-white border-black"
                    : "border-border/60",
                ].join(" ")}
              >
                {label}  {/* UI 전용 */}
              </button>
            );
          })}

        </div>

        {/* CITY – search first */}
        {observerRegion && (
          <div className="space-y-3">
            <input
              type="search"
              placeholder={`Search local footprint in ${observerRegion}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="
                w-full h-11
                rounded-xl
                bg-muted/40
                px-4
                text-sm
                outline-none
              "
            />

            <div className="divide-y">
              {filteredCities.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onPickCity(c);
                    onClose(); // ✅ 선택 즉시 닫힘 (2026 패턴)
                  }}
                  className="
                    w-full py-3
                    text-left text-sm
                    active:scale-[0.98]
                    transition
                  "
                >
                  {c}
                </button>
              ))}

              {filteredCities.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No cities found
                </p>
              )}
            </div>
          </div>
        )}

        {/* OPERATIONAL BASE */}
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={() => {
              onClose();      // LocationSheet 닫고
              onSetAnchor();  // AnchorSetupSheet 열기
            }}
            className="
              w-full h-11
              rounded-xl
              border
              text-sm font-semibold
              active:scale-[0.98]
              transition
            "
          >
            Set operational base
          </button>
        </div>
      </div>
    </div>
  );
}
