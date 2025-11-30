// src/app/meetups/[meetupId]/components/MapSection.tsx

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./MapSectionClient"), { ssr: false });

interface MapSectionProps {
  lat: number;
  lng: number;
  locationName: string;
  address?: string;
  datetime?: string;
  findUsNote?: string;
  meetupId?: string;
  isHost?: boolean;
}

export default function MapSection({
  lat: initialLat,
  lng: initialLng,
  locationName: initialLocation,
  address: initialAddress,
  datetime,
  findUsNote: initialNote,
  meetupId,
  isHost = false,
}: MapSectionProps) {
  const [editMode, setEditMode] = useState(false);

  const [locationName, setLocationName] = useState(initialLocation || "");
  const [findUsNote, setFindUsNote] = useState(initialNote || "");
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [address, setAddress] = useState(initialAddress || "");
  const [loading, setLoading] = useState(false);

  const formattedDate = datetime
    ? new Date(datetime).toLocaleString("en-GB", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  /** Auto geocode when editing & typing a new location */
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!editMode || !locationName.trim()) return;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
            locationName
          )}`
        );
        const data = await res.json();

        if (data && data[0]) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          const addr = data[0].address;

          const formatted = [
            addr.amenity || addr.name || locationName,
            addr.road,
            addr.city || addr.town || addr.village || addr.suburb,
            addr.country,
            addr.postcode,
          ]
            .filter(Boolean)
            .join(", ");

          setLat(newLat);
          setLng(newLng);
          setAddress(formatted);
        }
      } catch (err) {
        console.warn("Geocoding failed:", err);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [locationName, editMode]);

  const handleSave = async () => {
    if (!meetupId) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/meetups/${meetupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findUsNote,
          location: {
            name: locationName,
            address: address || locationName,
            lat,
            lng,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed");
      alert("Location updated!");
      setEditMode(false);
    } catch {
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full pt-4 pb-8 border-t border-border">

      {/* Title + Edit */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          📍 Location
        </h2>

        {isHost && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="text-sm text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {/* VIEW MODE */}
      {!editMode && (
        <>
          {/* Name + Address */}
          <div className="mb-4 space-y-1">
            <h3 className="text-base font-medium text-foreground">
              {locationName || "Unknown location"}
            </h3>

            {address && (
              <p className="text-sm text-muted-foreground">{address}</p>
            )}

            {/* Maps Link */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-block mt-1"
            >
              Open in Google Maps →
            </a>
          </div>

          {/* Map */}
          <div className="h-72 w-full overflow-hidden rounded-lg border border-border">
            <LeafletMap lat={lat} lng={lng} locationName={locationName} />
          </div>

          {/* How to find us */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-1">How to find us</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {findUsNote?.trim()
                ? findUsNote
                : "No additional directions provided."}
            </p>
          </div>
        </>
      )}

      {/* EDIT MODE */}
      {editMode && (
        <div className="space-y-5">

          {/* Name input */}
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Location name
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
            />
          </div>

          {/* Map (editable) */}
          <div className="h-72 w-full rounded-lg border border-border overflow-hidden">
            <LeafletMap
              lat={lat}
              lng={lng}
              locationName={locationName}
              editable={isHost}
              onPositionChange={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
              }}
            />
          </div>

          {/* Find us note */}
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              How to find us
            </label>
            <textarea
              value={findUsNote}
              onChange={(e) => setFindUsNote(e.target.value)}
              rows={3}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditMode(false);
                setLocationName(initialLocation || "");
                setFindUsNote(initialNote || "");
                setLat(initialLat);
                setLng(initialLng);
                setAddress(initialAddress || "");
              }}
              className="text-sm text-muted-foreground hover:underline"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-1.5 bg-primary text-white rounded-full text-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
