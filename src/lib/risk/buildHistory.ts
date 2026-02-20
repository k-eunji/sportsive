//src/lib/risk/buildHistory.ts

export function buildHistoryFromEvents(events: any[]) {
  const map = new Map<string, number>();

  for (const e of events) {
    const key = (e.date ?? e.startDate ?? e.utcDate)?.slice(0, 10);
    if (!key) continue;

    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.values());
}
