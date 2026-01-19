// src/app/components/home/LocationSheet.tsx
"use client";

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
  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-background px-5 pt-4 pb-[env(safe-area-inset-bottom)] space-y-4">

        <p className="text-sm font-semibold">Location</p>

        {/* ✅ REGION LIST (항상 노출) */}
        <div className="flex flex-wrap gap-2">
          {/* ✅ ALL */}
          <button
            onClick={() => onPickRegion(null)}
            className={[
              "px-3 py-1.5 rounded-full text-sm border transition",
              observerRegion === null
                ? "bg-black text-white border-black"
                : "bg-background border-border/60 hover:bg-background/80",
            ].join(" ")}
          >
            All
          </button>

          {/* ✅ REGIONS */}
          {regions.map((r) => {
            const active = r === observerRegion;

            return (
              <button
                key={r}
                onClick={() => onPickRegion(r)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm border transition",
                  active
                    ? "bg-black text-white border-black"
                    : "bg-background border-border/60 hover:bg-background/80",
                ].join(" ")}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* ✅ CITY LIST (선택된 region 기준) */}
        {observerRegion && cities.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Cities in {observerRegion}
            </p>

            <div className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => onPickCity(c)}
                  className="px-3 py-1.5 rounded-full border text-sm hover:bg-background/80"
                >
                  {c}
                </button>
              ))}
            </div>

            {/* ✅ LIVE SEARCH HINT */}
            <div className="pt-2 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                {observerRegion === null
                  ? "Showing matches from all regions"
                  : cities.length > 0
                  ? "Showing matches in this region — you can also pick a city"
                  : "Showing matches in this region"}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
