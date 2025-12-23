// src/app/meetups/components/form/VenueFields.tsx
"use client";

import { useEffect, useRef } from "react";
import { useGoogleMaps } from "@/components/GoogleMapsProvider";

export default function VenueFields({ form, meetupType }: any) {
  const { isLoaded } = useGoogleMaps();
  const { setVenue } = form;

  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef =
    useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  const shouldShow =
    isLoaded &&
    ["match_attendance", "pub_gathering", "pickup_sports"].includes(meetupType);

  useEffect(() => {
    if (!shouldShow) return;
    if (!containerRef.current) return;
    if (autocompleteRef.current) return;

    let isCancelled = false;

    (async () => {
      // ✅ 2026형: importLibrary('places') 필수
      await google.maps.importLibrary("places");

      if (isCancelled) return;

      const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement(
        {}
      );

      // ✅ 2026형: 국가 제한은 includedRegionCodes 사용 권장
      // (componentRestrictions 대신)
      (placeAutocomplete as any).includedRegionCodes = ["gb"];

      containerRef.current!.appendChild(placeAutocomplete);
      autocompleteRef.current = placeAutocomplete;

      // ✅ 2026형: gmp-select 이벤트로 선택 감지
      // @ts-ignore
      placeAutocomplete.addEventListener(
        "gmp-select",
        // @ts-ignore
        async ({ placePrediction }) => {
          try {
            const place = placePrediction.toPlace();

            // ✅ 필요한 필드만 fetch (location은 여기서 가져옴)
            await place.fetchFields({
              fields: ["displayName", "formattedAddress", "location"],
            });

            if (!place.location) return;

            const lat = place.location.lat();
            const lng = place.location.lng();

            setVenue({
              name:
                place.formattedAddress ||
                place.displayName?.text ||
                "",
              lat,
              lng,
            });

            console.log("✅ Venue selected:", place.formattedAddress, lat, lng);
          } catch (e) {
            console.warn("❌ place fetchFields failed:", e);
          }
        }
      );
    })();

    return () => {
      isCancelled = true;
      if (autocompleteRef.current) {
        autocompleteRef.current.remove();
        autocompleteRef.current = null;
      }
    };
  }, [shouldShow, setVenue]);

  if (!shouldShow) return null;

  return (
    <div className="mt-8 space-y-2">
      <p className="text-[12px] uppercase tracking-wide text-gray-500">
        Meeting place
      </p>
      <div ref={containerRef} />
    </div>
  );
}
