// src/app/components/home/RadiusFilter.tsx
"use client";

export type ViewScope = "nearby" | "city" | "country" | "global";

export default function RadiusFilter({
  scope,
  onOpen,
  enabled,
}: {
  scope: ViewScope;
  onOpen: () => void;
  enabled: boolean;
}) {
  if (!enabled) return null;

  const label =
    scope === "nearby"
      ? "Nearby"
      : scope === "city"
      ? "Around me"
      : scope === "country"
      ? "Wider"
      : "Global";

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
        <span>Showing {label}</span>
        <span className="text-xs text-muted-foreground">Change</span>
      </button>
    </div>
  );
}
