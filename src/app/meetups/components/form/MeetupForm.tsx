// src/app/meetups/components/form/MeetupForm.tsx

"use client";

import { useRef, useState, useCallback } from "react";
import VenueFields from "./VenueFields";

/**
 * ✅ Next.js 15 + Tailwind 4 호환 MeetupForm
 * - 모든 입력은 controlled input으로 관리
 * - focus 시 ring 효과 적용
 * - 반응형 / 접근성 강화
 */
export default function MeetupForm() {
  // --------------------------
  // 📍 1. 기본 폼 상태
  // --------------------------
  const [title, setTitle] = useState("");
  const [meetupType, setMeetupType] = useState<
    "match_attendance" | "pub_gathering" | "pickup_sports"
  >("match_attendance");

  // --------------------------
  // 🗺️ 2. Venue 관련 상태
  // --------------------------
  const [venueInput, setVenueInput] = useState("");
  const [venueLocation, setVenueLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  const venueInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [showMap, setShowMap] = useState(false);

  // --------------------------
  // ✏️ 3. Venue 입력 핸들러
  // --------------------------
  const handleVenueChange = useCallback((value: string) => {
    setVenueInput(value);
  }, []);

  // --------------------------
  // 📦 4. form 객체 (VenueFields로 전달)
  // --------------------------
  const form = {
    venueInputRef,
    mapRef,
    showMap,
    setShowMap,
    handleVenueChange,
    venueInput,
    setVenueLocation,
    mapInstance,
    geocoderRef,
  };

  // --------------------------
  // 💾 5. 제출 핸들러
  // --------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!venueLocation) {
      alert("Please select a venue location before submitting!");
      return;
    }

    const body = {
      title,
      type: meetupType,
      location: venueLocation,
    };

    try {
      const res = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create meetup");

      alert("✅ Meetup created successfully!");
      setTitle("");
      setVenueInput("");
      setVenueLocation(null);
      setShowMap(false);
    } catch (err) {
      console.error("❌ Error creating meetup:", err);
      alert("Failed to create meetup. Please try again.");
    }
  };

  // --------------------------
  // 🧱 6. 렌더링
  // --------------------------
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-100 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center sm:text-left">
        Create a New Meetup
      </h2>

      {/* ✅ Title */}
      <div>
        <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Weekend Football Match"
          required
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        />
      </div>

      {/* ✅ Meetup Type */}
      <div>
        <label htmlFor="meetupType" className="block text-gray-700 font-medium mb-1">
          Type
        </label>
        <select
          id="meetupType"
          value={meetupType}
          onChange={(e) => setMeetupType(e.target.value as any)}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        >
          <option value="match_attendance">Match Attendance</option>
          <option value="pub_gathering">Pub Gathering</option>
          <option value="pickup_sports">Pickup Sports</option>
        </select>
      </div>

      {/* ✅ Venue Fields (주소 + 지도) */}
      <VenueFields form={form} meetupType={meetupType} />

      {/* ✅ Submit */}
      <button
        type="submit"
        className="w-full sm:w-auto bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 transition-colors"
      >
        Create Meetup
      </button>
    </form>
  );
}
