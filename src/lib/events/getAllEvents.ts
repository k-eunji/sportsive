// src/lib/events/getAllEvents.ts

import { GET as getFootballEvents } from "@/app/api/events/england/football/route";
import { GET as getRugbyEvents } from "@/app/api/events/england/rugby/route";
import { GET as getTennisEvents } from "@/app/api/events/england/tennis/route";
import { GET as getHorseRacingEvents } from "@/app/api/events/england/horseRacing/route";
import { GET as getBasketballEvents } from "@/app/api/events/england/basketball/route";
import { GET as getDartEvents } from "@/app/api/events/england/dart/route";
import { GET as getCricketEvents } from "@/app/api/events/england/cricket/route";

import { buildAreaIndex } from "@/lib/events/buildAreaIndex";
import { isEventActiveInWindow } from "@/lib/events/lifecycle";

/* =========================
   DEDUPE
========================= */
function dedupeById(events: any[]) {
  return Array.from(
    new Map(
      events.map((e) => [
        `${e.sport ?? "unknown"}-${e.id}`,  // 🔥 sport 포함
        e,
      ])
    ).values()
  );
}


export async function getAllEvents(window: string = "7d") {
  const [
    footballRes,
    rugbyRes,
    tennisRes,
    horseRacingRes,
    basketballRes,
    dartRes,
    cricketRes,
  ] = await Promise.all([
    getFootballEvents(),
    getRugbyEvents(),
    getTennisEvents(),
    getHorseRacingEvents(),
    getBasketballEvents(),
    getDartEvents(),
    getCricketEvents(),
  ]);

  const footballData = await footballRes.json();
  const rugbyData = await rugbyRes.json();
  const tennisData = await tennisRes.json();
  const horseRacingData = await horseRacingRes.json();
  const basketballData = await basketballRes.json();
  const dartData = await dartRes.json();
  const cricketData = await cricketRes.json();

  /* =========================
     1️⃣ RAW MERGE
  ========================= */
  const mergedRaw = [
    ...(footballData.matches ?? footballData.events ?? []),
    ...(rugbyData.matches ?? rugbyData.events ?? []),
    ...(tennisData.matches ?? tennisData.events ?? []),
    ...(horseRacingData.matches ?? horseRacingData.events ?? []),
    ...(basketballData.events ?? []),
    ...(dartData.matches ?? dartData.events ?? []),
    ...(cricketData.events ?? []),
  ];

  const merged = dedupeById(mergedRaw);

  /* =========================
     2️⃣ WINDOW RANGE
  ========================= */
  const now = new Date();
  const windowEnd = new Date(now);

  if (window === "today") {
    windowEnd.setHours(23, 59, 59, 999);
  } else if (window === "7d") {
    windowEnd.setDate(windowEnd.getDate() + 7);
  } else if (window === "30d") {
    windowEnd.setDate(windowEnd.getDate() + 30);
  } else if (window === "60d") {
    windowEnd.setDate(windowEnd.getDate() + 60);
  } else if (window === "180d") {
    windowEnd.setDate(windowEnd.getDate() + 180);
  }

  /* =========================
    3️⃣ LIFECYCLE FILTER
  ========================= */

  let filteredBase: any[];

  if (window === "all") {
    // ✅ 완전 무제한
    filteredBase = merged;
  } else if (window === "180d") {
    // ✅ 180일도 무제한으로 쓸 거면 그대로
    filteredBase = merged;
  } else {
    filteredBase = merged.filter((e: any) =>
      isEventActiveInWindow(e, now, windowEnd)
    );
  }
  
  const filtered = filteredBase
    .map((e: any) => ({
      ...e,
      startAtUtc: e.date ?? e.utcDate ?? e.startDate,
    }))
    .sort(
      (a: any, b: any) =>
        new Date(a.startAtUtc).getTime() -
        new Date(b.startAtUtc).getTime()
    );

  /* =========================
     4️⃣ RETURN
  ========================= */
  if (window === "all") {
    filteredBase = merged; // ✅ 아무 제한 없음
  } else if (window === "180d") {
    filteredBase = merged; // 필요하면 유지
  } else {
    filteredBase = merged.filter((e: any) =>
      isEventActiveInWindow(e, now, windowEnd)
    );
  }
  return { events: filtered };
}
