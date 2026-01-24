// src/app/components/home/LocationSheet.tsx
"use client";

import { useMemo, useState } from "react";

export default function LocationSheet({
  regions,
  cities,
  observerRegion,
  onPickRegion,
  onPickCity,
  onClose,
}: {
  regions: string[];
  cities: string[];
  observerRegion: string | null;
  onPickRegion: (r: string | null) => void;
  onPickCity: (c: string) => void;
  onClose: () => void;
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
        <p className="text-sm font-semibold mb-3">Location</p>

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
            All
          </button>

          {regions.slice(0, 6).map((r) => {
            const active = r === observerRegion;
            return (
              <button
                key={r}
                onClick={() => onPickRegion(r)}
                className={[
                  "shrink-0 px-3 py-1.5 rounded-full text-sm border",
                  active
                    ? "bg-black text-white border-black"
                    : "border-border/60",
                ].join(" ")}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* CITY – search first */}
        {observerRegion && (
          <div className="space-y-3">
            <input
              type="search"
              placeholder={`Search city in ${observerRegion}`}
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
      </div>
    </div>
  );
}
