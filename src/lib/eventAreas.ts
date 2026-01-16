//src/lib/eventAreas.ts

type EventWithArea = {
  region?: string | null;
  city?: string | null;
};

export function extractRegions(events: EventWithArea[]): string[] {
  return Array.from(
    new Set(
      events
        .map((e) => e.region)
        .filter((r): r is string => typeof r === "string")
    )
  ).sort();
}

export function extractCities(
  events: EventWithArea[],
  region: string
): string[] {
  return Array.from(
    new Set(
      events
        .filter((e) => e.region === region)
        .map((e) => e.city)
        .filter((c): c is string => typeof c === "string")
    )
  ).sort();
}
