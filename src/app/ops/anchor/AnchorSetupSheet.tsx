// src/app/ops/anchor/AnchorSetupSheet.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function AnchorSetupSheet({
  areaLabel,
  onSubmit,
  onClose,
}: {
  areaLabel: string | null;
  onSubmit: (
    label: string,
    location: { lat: number; lng: number }
  ) => void;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (!inputRef.current) return;
    if (!window.google?.maps?.places) return;

    autocompleteRef.current =
      new google.maps.places.Autocomplete(inputRef.current, {
        fields: ["formatted_address", "geometry"],
      });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current!.getPlace();
      if (!place.geometry?.location) return;

      onSubmit(
        place.formatted_address || "Selected location",
        {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        }
      );

      onClose();
    });
  }, [onSubmit, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b">
        <button
          onClick={handleClose}
          className="text-sm font-semibold"
        >
          ← Back
        </button>
        <span className="text-sm font-semibold">
          Search location
        </span>
      </div>

      <div className="p-4 flex-1">
        {areaLabel && (
          <p className="text-xs text-muted-foreground mb-2">
            {areaLabel}
          </p>
        )}

        <input
          ref={inputRef}
          type="text"
          placeholder="Search address, place, or city"
          className="
            w-full h-11
            rounded-xl
            bg-muted/40
            px-4
            text-sm
            outline-none
          "
          autoFocus
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Select a place from the suggestions
        </p>
      </div>
    </div>
  );
}
