// src/app/meetups/hooks/useMeetupForm.ts

"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Event } from "@/types";

export interface Venue {
  name: string;
  lat: number;
  lng: number;
}

export interface UseMeetupFormProps {
  meetupType:
    | "match_attendance"
    | "pub_gathering"
    | "online_game"
    | "pickup_sports"
    | "other";
  upcomingEvents: Event[];
}

export function useMeetupForm({ meetupType }: UseMeetupFormProps) {
  // ────────────────────────────────
  // 📦 기본 상태
  // ────────────────────────────────
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [cheerTeam, setCheerTeam] =
    useState<"home" | "away" | "neutral">("neutral");
  const [venue, setVenue] = useState<Venue | null>(null);
  const [venueLatLng, setVenueLatLng] =
    useState<{ lat: number; lng: number } | null>(null);
  const [datetime, setDatetime] = useState("");
  const [showMap, setShowMap] = useState(false);

  // ────────────────────────────────
  // 🧩 확장 상태 (그대로 유지)
  // ────────────────────────────────
  const [purpose, setPurpose] = useState("");
  const [maxParticipants, setMaxParticipants] =
    useState<number | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [onlineLink, setOnlineLink] = useState("");
  const [repeat, setRepeat] =
    useState<"none" | "weekly" | "monthly">("none");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");

  const [ageLimit, setAgeLimit] = useState("All ages");
  const [ageFrom, setAgeFrom] = useState<number | "">("");
  const [ageTo, setAgeTo] = useState<number | "">("");
  const [skillLevel, setSkillLevel] =
    useState<"any" | "beginner" | "intermediate" | "advanced">("any");
  const [fee, setFee] = useState<number | "">("");

  const [details, setDetails] = useState("");
  const [onlinePlatform, setOnlinePlatform] =
    useState<"Zoom" | "Discord" | "Other">("Zoom");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [deadlineOption, setDeadlineOption] =
    useState<"until" | "30min" | "1hour" | "1day" | "2days" | "custom">("until");
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [autoImageUrl, setAutoImageUrl] = useState<string | null>(null);

  const [useCustomImage, setUseCustomImage] = useState(false);
  const [onlineGameName, setOnlineGameName] = useState("");
  const [sportType, setSportType] = useState("");
  const [findUsNote, setFindUsNote] = useState("");

  // ────────────────────────────────
  // 🗺️ Google Maps (Places ❌)
  // ────────────────────────────────
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  /** 🧭 선택된 이벤트가 있을 때 초기화 */
  useEffect(() => {
    if (!selectedEvent) return;

    setDatetime(selectedEvent.date);
    setCheerTeam("home");
  }, [selectedEvent]);

  /** 🕓 datetime-local 변환 */
  const getDatetimeLocalValue = useCallback((iso: string) => {
    const d = new Date(iso);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
  }, []);

  // ────────────────────────────────
  // 🧩 반환
  // ────────────────────────────────
  return useMemo(
    () => ({
      selectedEvent,
      setSelectedEvent,
      cheerTeam,
      setCheerTeam,
      venue,
      setVenue,
      venueLatLng,
      setVenueLatLng,
      datetime,
      setDatetime,
      showMap,
      setShowMap,
      mapRef,
      mapInstance,
      geocoderRef,
      getDatetimeLocalValue,
      purpose,
      setPurpose,
      maxParticipants,
      setMaxParticipants,
      isPrivate,
      setIsPrivate,
      onlineLink,
      setOnlineLink,
      repeat,
      setRepeat,
      tags,
      setTags,
      ageLimit,
      setAgeLimit,
      ageFrom,
      setAgeFrom,
      ageTo,
      setAgeTo,
      skillLevel,
      setSkillLevel,
      fee,
      setFee,
      details,
      setDetails,
      onlinePlatform,
      setOnlinePlatform,
      applicationDeadline,
      setApplicationDeadline,
      deadlineOption,
      setDeadlineOption,
      customImage,
      setCustomImage,
      autoImageUrl,
      setAutoImageUrl,
      useCustomImage,
      setUseCustomImage,
      title,
      setTitle,
      onlineGameName,
      setOnlineGameName,
      sportType,
      setSportType,
      findUsNote,
      setFindUsNote,
    }),
    [
      selectedEvent,
      cheerTeam,
      venue,
      venueLatLng,
      datetime,
      showMap,
      purpose,
      maxParticipants,
      isPrivate,
      onlineLink,
      repeat,
      tags,
      ageLimit,
      ageFrom,
      ageTo,
      skillLevel,
      fee,
      details,
      onlinePlatform,
      applicationDeadline,
      deadlineOption,
      customImage,
      autoImageUrl,
      useCustomImage,
      title,
      onlineGameName,
      sportType,
      findUsNote,
    ]
  );
}

export type MeetupFormReturn = ReturnType<typeof useMeetupForm>;
