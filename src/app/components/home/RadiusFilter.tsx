// src/app/components/home/RadiusFilter.tsx
"use client";

export type RadiusKm = number;

export default function RadiusFilter({
  valueKm,
  onOpen,
}: {
  valueKm: RadiusKm;
  onOpen: () => void;
}) {
  const label =
    valueKm <= 5
      ? "Nearby"
      : valueKm <= 10
      ? "Around me"
      : "Wider area";

  return (
    <div className="px-6">
      <button
        onClick={onOpen}
        className="
          w-full
          flex items-center justify-between
          rounded-full
          px-4 py-2.5
          text-sm font-medium
          border border-border/60
          bg-background/60
          backdrop-blur
        "
      >
        <span>Within {label}</span>
        <span className="text-xs text-muted-foreground">Change</span>
      </button>
    </div>
  );
}
