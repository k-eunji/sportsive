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

/**
 * ✅ useMeetupForm
 * 밋업 생성/수정 시 사용하는 중앙 상태 훅
 * - Google Maps + Places API 연동
 * - 이미지 자동화
 * - 유효성/위치 정보/기본값 관리
 */
export function useMeetupForm({ meetupType }: UseMeetupFormProps) {
  // ────────────────────────────────
  // 📦 기본 상태
  // ────────────────────────────────
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [cheerTeam, setCheerTeam] = useState<"home" | "away" | "neutral">("neutral");
  const [venue, setVenue] = useState<Venue | null>(null);
  const [venueLatLng, setVenueLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [venueInput, setVenueInput] = useState("");
  const [datetime, setDatetime] = useState("");
  const [showMap, setShowMap] = useState(false);

  // ────────────────────────────────
  // 🧩 확장 상태
  // ────────────────────────────────
  const [purpose, setPurpose] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [onlineLink, setOnlineLink] = useState("");
  const [repeat, setRepeat] = useState<"none" | "weekly" | "monthly">("none");
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");

  // 나이 / 기술 수준 / 요금
  const [ageLimit, setAgeLimit] = useState("All ages");
  const [ageFrom, setAgeFrom] = useState<number | "">("");
  const [ageTo, setAgeTo] = useState<number | "">("");
  const [skillLevel, setSkillLevel] = useState<"any" | "beginner" | "intermediate" | "advanced">("any");
  const [fee, setFee] = useState<number | "">("");

  // 기타 상세 필드
  const [details, setDetails] = useState("");
  const [onlinePlatform, setOnlinePlatform] = useState<"Zoom" | "Discord" | "Other">("Zoom");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [deadlineOption, setDeadlineOption] = useState<"until" | "30min" | "1hour" | "1day" | "2days" | "custom">("until");
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [autoImageUrl, setAutoImageUrl] = useState("/images/default_meetup.jpg");
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [onlineGameName, setOnlineGameName] = useState("");
  const [sportType, setSportType] = useState("");
  const [findUsNote, setFindUsNote] = useState("");

  // ────────────────────────────────
  // 🗺️ Google Maps / Places 관련
  // ────────────────────────────────
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const venueInputRef = useRef<HTMLInputElement | null>(null);

  /** 🧭 선택된 이벤트가 있을 때 날짜/위치 초기화 */
  useEffect(() => {
    if (!selectedEvent) return;
    setDatetime(selectedEvent.date);
    setVenue(null);
    setVenueInput("");
    setCheerTeam("home");
  }, [selectedEvent]);

  /** 🔁 Meetup Type 변경 시 관련 필드 초기화 */
  useEffect(() => {
    setOnlineLink("");
    setVenue(null);
    setSelectedEvent(null);
  }, [meetupType]);

  /** 🗺️ 지도 초기화 */
  useEffect(() => {
    if (!showMap || !mapRef.current || !(window as any).google) return;

    const google = (window as any).google;
    try {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: 51.505, lng: -0.09 },
        zoom: 13,
      });
      geocoderRef.current = new google.maps.Geocoder();

      mapInstance.current!.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setVenueLatLng({ lat, lng });

        geocoderRef.current?.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            setVenue({
              name: results[0].formatted_address,
              lat,
              lng,
            });
          }
        });
      });
    } catch (err) {
      console.error("❌ Google Maps init failed:", err);
    }
  }, [showMap]);

  /** 📍 장소 자동완성 */
  useEffect(() => {
    if (!venueInputRef.current || !(window as any).google?.maps?.places) return;
    const google = (window as any).google;

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
      setVenueLatLng({ lat, lng });
      setVenueInput(name);
    });
  }, []);

  /** 🧭 수동 입력으로 장소 검색 */
  const handleVenueChange = useCallback((input: string) => {
    setVenueInput(input);

    if (!geocoderRef.current || !mapInstance.current) return;
    if (!input) {
      setVenue(null);
      setVenueLatLng(null);
      return;
    }

    geocoderRef.current.geocode({ address: input }, (results, status) => {
      if (status !== "OK" || !results?.length) return;
      const loc = results[0].geometry.location;
      const lat = loc.lat();
      const lng = loc.lng();
      setVenue({ name: results[0].formatted_address, lat, lng });
      setVenueLatLng({ lat, lng });

      mapInstance.current?.setCenter({ lat, lng });
      new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current!,
      });
    });
  }, []);


  /** 🕓 datetime-local 변환 헬퍼 */
  const getDatetimeLocalValue = useCallback((iso: string) => {
    const d = new Date(iso);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  }, []);

  // ────────────────────────────────
  // 🧩 반환 (useMemo로 최적화)
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
      venueInput,
      setVenueInput,
      venueInputRef,
      datetime,
      setDatetime,
      showMap,
      setShowMap,
      mapRef,
      mapInstance,
      geocoderRef,
      handleVenueChange,
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
      venueInput,
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
