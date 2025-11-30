// src/app/meetups/components/form/VenueFields.tsx

"use client";

import React, { useEffect } from "react";

interface VenueFieldsProps {
  form: any;
  meetupType: string;
}

export default function VenueFields({ form, meetupType }: VenueFieldsProps) {
  const {
    venueInputRef,
    mapRef,
    showMap,
    setShowMap,
    handleVenueChange,
    venueInput,
    setVenue,
    mapInstance,
    geocoderRef,
  } = form;

  // 지도 사용 안 하는 타입은 렌더링하지 않음
  if (!["match_attendance", "pub_gathering", "pickup_sports"].includes(meetupType)) {
    return null;
  }

  // ======================================================
  // ⭐ 1. Google Places Autocomplete (기존 기능 유지)
  // ======================================================
  useEffect(() => {
    const google = (window as any).google;
    if (!google?.maps?.places) return;
    if (!venueInputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(venueInputRef.current, {
      types: ["establishment"],
      componentRestrictions: { country: "gb" },
      fields: ["name", "formatted_address", "geometry"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const name = place.formatted_address || place.name || "";

      setVenue({ name, lat, lng });

      if (mapInstance.current) {
        mapInstance.current.setCenter({ lat, lng });
        new google.maps.Marker({
          position: { lat, lng },
          map: mapInstance.current,
        });
      }
    });
  }, [venueInputRef]);

  // ======================================================
  // ⭐ 2. 지도 초기화 (기존 기능 유지)
  // ======================================================
  useEffect(() => {
    if (!showMap || !mapRef.current) return;

    const google = (window as any).google;
    if (!google) return;

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: 51.505, lng: -0.09 },
        zoom: 13,
      });

      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [showMap]);

  // ======================================================
  // ⭐ 3. 입력값 변경 시 geocode (기존 기능 유지)
  // ======================================================
  useEffect(() => {
    if (!venueInput) return;

    const google = (window as any).google;
    if (!google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: venueInput }, (results: any, status: any) => {
      if (status === "OK" && results?.[0]) {
        const loc = results[0].geometry.location;

        const lat = loc.lat();
        const lng = loc.lng();

        setVenue({
          name: results[0].formatted_address,
          lat,
          lng,
        });

        if (mapInstance.current) {
          mapInstance.current.setCenter({ lat, lng });

          new google.maps.Marker({
            map: mapInstance.current,
            position: { lat, lng },
          });
        }
      }
    });
  }, [venueInput]);

  // ======================================================
  // ⭐ 4. UI만 심플하게 변경
  // ======================================================
  return (
    <div className="mt-10 space-y-6">

      {/* Label */}
      <p className="text-[12px] uppercase tracking-wide text-gray-500">
        Venue
      </p>

      {/* Input */}
      <input
        ref={venueInputRef}
        type="text"
        value={venueInput}
        onChange={(e) => handleVenueChange(e.target.value)}
        onFocus={() => setShowMap(true)}
        placeholder="Enter address"
        className="
          w-full border-b border-gray-300 py-2 text-[15px]
          bg-transparent placeholder-gray-400
          focus:outline-none focus:border-black
        "
      />

      {/* Map */}
      {showMap && (
        <div
          ref={mapRef}
          className="mt-4 w-full h-56 rounded-xl border border-gray-200 overflow-hidden"
        />
      )}

      {/* How to find us */}
      <div className="mt-6">
        <p className="text-[12px] uppercase tracking-wide text-gray-500 mb-2">
          How to find us
        </p>
        <textarea
          value={form.findUsNote || ""}
          onChange={(e) => form.setFindUsNote(e.target.value)}
          placeholder="Optional"
          rows={2}
          className="
            w-full border-b border-gray-300 py-2 text-[15px]
            bg-transparent resize-none placeholder-gray-400
            focus:outline-none focus:border-black
          "
        />
      </div>
    </div>
  );
}
