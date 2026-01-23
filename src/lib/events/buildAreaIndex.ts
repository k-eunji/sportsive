// src/lib/events/buildAreaIndex.ts
export function buildAreaIndex(events: any[]) {
  const map = new Map();

  for (const e of events) {
    if (!e.city || !e.region || !e.location) continue;

    if (!map.has(e.city)) {
      map.set(e.city, {
        city: e.city,
        region: e.region,
        center: e.location,
      });
    }
  }

  return Array.from(map.values());
}
