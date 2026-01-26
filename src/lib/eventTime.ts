// src/lib/eventTime.ts

export type EventTimeState =
  | "LIVE"
  | "SOON"
  | "UPCOMING"
  | "ENDED";

export function getDefaultDurationMs(e: {
  durationMs?: number;
  sport?: string;
}): number {
  if (e.durationMs) return e.durationMs;

  switch (e.sport) {
    case "football":
    case "rugby":
      return 2.5 * 60 * 60 * 1000;
    case "basketball":
      return 2 * 60 * 60 * 1000;
    case "tennis":
      return 3 * 60 * 60 * 1000;
    case "horse-racing":
      return 6 * 60 * 60 * 1000;
    case "darts": // ✅ 추가
      return 4 * 60 * 60 * 1000;    
    default:
      return 2 * 60 * 60 * 1000;
  }
}


export function getSoonWindowMs(e: {
  soonWindowMs?: number;
  sport?: string;
}): number {
  if (e.soonWindowMs) return e.soonWindowMs;

  switch (e.sport) {
    case "tennis":
      return 60 * 60 * 1000;
    case "basketball":
      return 90 * 60 * 1000;
    case "horse-racing":
      return 4 * 60 * 60 * 1000;
    case "darts": // ✅ 추가
      return 4 * 60 * 60 * 1000;     
    default:
      return 2 * 60 * 60 * 1000;
  }
}

export function getEventTimeState(
  e: {
    startDate?: string | Date;
    date?: string | Date;
    utcDate?: string | Date;
    durationMs?: number;
    soonWindowMs?: number;
    sport?: string;
  },
  now: Date = new Date()
): EventTimeState {
  const raw = e.startDate ?? e.date ?? e.utcDate;
  const start = new Date(raw as any);

  if (isNaN(start.getTime())) return "ENDED";

  const end = new Date(start.getTime() + getDefaultDurationMs(e));
  const diffMs = start.getTime() - now.getTime();

  if (now >= start && now <= end) return "LIVE";
  if (diffMs > 0 && diffMs <= getSoonWindowMs(e)) return "SOON";
  if (diffMs > 0) return "UPCOMING";

  return "ENDED";
}
