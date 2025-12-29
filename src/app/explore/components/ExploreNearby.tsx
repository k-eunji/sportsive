// src/app/explore/components/ExploreNearby.tsx
"use client";

import { useEffect, useState } from "react";
import MiniEventMap from "./MiniEventMap";
import Link from "next/link";

function formatDateUK(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// 도시 normalize
function normalizeCity(city?: string | null) {
  if (!city) return "";
  return city.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "");
}

export default function ExploreNearby() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [nearby, setNearby] = useState<any[]>([]);
  const [city, setCity] = useState<string | null>(null);

  // --- 1) 사용자 좌표 가져오기 ---
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setLocation({ lat: 51.5074, lng: -0.1278 }) // fallback: London
    );
  }, []);

  // --- 2) 좌표 → 도시 resolve ---
  useEffect(() => {
    if (!location) return;

    async function detectCity() {
      const res = await fetch(
        `/api/geo/resolve?lat=${location?.lat}&lng=${location?.lng}`
      );
      const data = await res.json();

      setCity(data?.city ?? null);
    }

    detectCity();
  }, [location]);

  // --- 3) API 이벤트 수집 ---
  useEffect(() => {
    async function load() {
      const [baseRes, footballRes, rugbyRes] = await Promise.allSettled([
        fetch("/api/events"),
        fetch("/api/events/england/football"),
        fetch("/api/events/england/rugby"),
      ]);


      let baseEvents: any[] = [];
      if (baseRes.status === "fulfilled" && baseRes.value.ok) {
        const json = await baseRes.value.json();
        baseEvents = json.events ?? [];
      }

      let footballEvents: any[] = [];
      if (footballRes.status === "fulfilled" && footballRes.value.ok) {
        const data = await footballRes.value.json();
        footballEvents = (data.matches ?? []).map((m: any) => ({
          id: m.id,
          date: m.date ?? m.utcDate,
          title: `${m.homeTeam} vs ${m.awayTeam}`,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          competition: m.competition,
          city: m.city,
          region: m.region,
          venue: m.venue,
          location: m.location, // football events use location.lat/lng
        }));
      }

      let rugbyEvents: any[] = [];
        if (rugbyRes.status === "fulfilled" && rugbyRes.value.ok) {
          const data = await rugbyRes.value.json();
          rugbyEvents = (data.matches ?? []).map((m: any) => ({
            id: m.id,
            date: m.date,
            title: `${m.homeTeam} vs ${m.awayTeam}`,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            competition: m.competition,
            city: m.city,
            region: m.region,
            venue: m.venue,
            location: m.location, // rugby도 동일 구조
          }));
        }

      const merged = [...baseEvents, ...footballEvents, ...rugbyEvents];

      const deduped = Array.from(
        new Map(
          merged.map((e) => [
            `${e.id}-${e.date}-${e.homeTeam}-${e.awayTeam}`,
            e,
          ])
        ).values()
      );

      setEvents(deduped);
    }

    load();
  }, []);

  // --- 4) 도시 기반 이벤트 필터링 ---
  useEffect(() => {
    if (!city || events.length === 0) return;

    const now = Date.now();
    const normalized = normalizeCity(city);

    const filtered = events
      .filter((e) => normalizeCity(e.city) === normalized)
      .filter((e) => e.date && new Date(e.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 7);

    setNearby(filtered);
  }, [city, events]);

  if (!city || nearby.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold mb-3">
        Upcoming Events in {city}
      </h2>

      <div className="w-full h-[220px] mb-3">
        {location && (
          <MiniEventMap
            center={location}
            events={nearby.map((e) => ({
              id: e.id,
              location: e.location,
            }))}
          />
        )}
      </div>

      <ul className="space-y-1 text-sm">
        {nearby.map((e) => (
          <li
            key={`${e.id}-${e.date}-${e.homeTeam}-${e.awayTeam}`}
            className="flex justify-between py-1"
          >
            <span>{e.title}</span>
            <span className="text-gray-500">{formatDateUK(e.date)}</span>
          </li>
        ))}
      </ul>

      <Link href="/events" className="block mt-2 text-blue-600 text-sm">
        View full events →
      </Link>
    </section>
  );
}
