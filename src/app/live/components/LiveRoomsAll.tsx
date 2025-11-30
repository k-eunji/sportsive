// src/app/live/components/LiveRoomsAll.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LiveNowSection from "./all/LiveNowSection";
import TrendingSection from "./all/TrendingSection";
import UpcomingSection from "./all/UpcomingSection";

export default function LiveRoomsAll() {
  const [rooms, setRooms] = useState([]);
  const searchParams = useSearchParams();
  const eventId = searchParams?.get("eventId");

  useEffect(() => {
    async function fetchRooms() {
      try {
        let url = "/api/live/all/rooms";
        if (eventId) url += `?eventId=${eventId}`;

        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        setRooms(Array.isArray(data.rooms) ? data.rooms : []);
      } catch (err) {
        console.error("Failed to fetch ALL rooms:", err);
      }
    }
    fetchRooms();
  }, [eventId]);

  return (
    <main className="max-w-5xl mx-auto px-4 pt-8 pb-24 space-y-14 animate-fadeIn">

      {/* Hero */}
      <section className="space-y-2">
        <h1 className="text-[28px] font-extrabold leading-tight">
          Explore Live Chats
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Find active rooms and join fans watching together.
        </p>
      </section>

      <LiveNowSection rooms={rooms} />
      <TrendingSection rooms={rooms} />
      <UpcomingSection rooms={rooms} />
    </main>
  );
}
