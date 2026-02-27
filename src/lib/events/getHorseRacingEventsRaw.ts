// src/lib/events/getHorseRacingEventsRaw.ts

import { GET as getHorseRacingEvents } 
  from "@/app/api/events/england/horseRacing/route";

export async function getHorseRacingEventsRaw() {
  const res = await getHorseRacingEvents();
  const data = await res.json();

  return data.matches ?? data.events ?? [];
}