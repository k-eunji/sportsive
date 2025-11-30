// lib/utils/dbToEvent.ts

import type { Event } from "@/types";

export const eventsFromDB = (dbRows: any[]): Event[] => {
  return dbRows.map(row => ({
    id: String(row.id),
    title: row.name,
    date: row.date ?? "",  
    location: { lat: row.lat, lng: row.lng, address: "" },
    venue: row.venue,
    city: row.city,
    region: row.region,
    homepageUrl: row.homepageUrl || undefined, // ✅ 여기를 camelCase로!
    competition: row.competition,
    free: true,
    organizerId: "",
    attendees: [],
    timeZone: row.timeZone || "UTC", 
  }));
};
