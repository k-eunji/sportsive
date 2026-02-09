//src/app/components/home/LocationAnchor.tsx

"use client";

export default function LocationAnchor({
  hasLocation,
  observerCity,
  onOpenLocationSheet,
}: {
  hasLocation: boolean;
  observerCity: string | null;
  onOpenLocationSheet: () => void;
}) {
  // 📍 위치 ON
  if (hasLocation) {
    return (
      <div
        className="
          inline-flex items-center
          px-3 py-1.5
          rounded-full
          bg-muted/60
          text-xs font-semibold
        "
      >
        Near you (25km)
      </div>
    );
  }

  // 👀 위치 OFF (observer)
  return (
    <button
      onClick={onOpenLocationSheet}
      className="
        inline-flex items-center gap-1
        px-3 py-1.5
        rounded-full
        bg-muted/60
        text-xs font-semibold
        hover:bg-muted
        transition
      "
    >
      {observerCity ?? "Choose a city"}
      <span className="text-[10px]">▾</span>
    </button>
  );
}
