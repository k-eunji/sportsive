// src/lib/eventTime.ts

export type EventTimeState =
  | "LIVE"
  | "SOON"
  | "UPCOMING"
  | "ENDED";

/* =========================
   기본 지속시간 (match용)
========================= */
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
    case "darts":
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
    case "horse-racing":
    case "darts":
      return 4 * 60 * 60 * 1000;
    case "tennis":
      return 60 * 60 * 1000;
    default:
      return 2 * 60 * 60 * 1000;
  }
}

/* =========================
   🟣 GENERIC SESSION WINDOW
   (darts / tennis / tournaments)
========================= */
function deriveSessionWindow(e: any): { start: Date; end: Date } | null {
  if (e.kind !== "session") return null;
  if (!e.startDate) return null;

  const start = new Date(e.startDate);
  const end = new Date(e.endDate ?? e.startDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  // 날짜만 있으면 하루 전체
  if (e.startDate.length === 10) {
    start.setHours(0, 0, 0, 0);
  }
  if ((e.endDate ?? e.startDate).length === 10) {
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

/* =========================
   🐎 HORSE RACING SESSION
========================= */
export function deriveHorseRacingSessionWindow(e: any): {
  start: Date;
  end: Date;
} | null {
  if (e.sport !== "horse-racing") return null;

  const label =
    e.payload?.sessionTime?.toLowerCase?.() ??
    e.sessionTime?.toLowerCase?.() ??
    "";

  const baseRaw = e.date ?? e.startDate;
  const base = new Date(baseRaw);
  if (isNaN(base.getTime())) return null;

  const day = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate()
  );

  if (label.includes("afternoon")) {
    const start = new Date(day);
    start.setHours(11, 0, 0, 0);
    const end = new Date(start);
    end.setHours(19, 0, 0, 0);
    return { start, end };
  }

  if (label.includes("evening")) {
    const start = new Date(day);
    start.setHours(16, 0, 0, 0);
    const end = new Date(start);
    end.setHours(24, 0, 0, 0);
    return { start, end };
  }

  if (label.includes("floodlit")) {
    const start = new Date(day);
    start.setHours(19, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setHours(1, 0, 0, 0);
    return { start, end };
  }

  return null;
}

/* =========================
   🧠 MAIN STATE CALCULATOR
========================= */
export function getEventTimeState(
  e: any,
  now: Date = new Date()
): EventTimeState {
  // 1️⃣ 🐎 horse racing override (MUST come first)
  const horse = deriveHorseRacingSessionWindow(e);
  if (horse) {
    if (now >= horse.start && now <= horse.end) return "LIVE";
    if (horse.start > now) {
      const diffMs = horse.start.getTime() - now.getTime();
      if (diffMs <= getSoonWindowMs(e)) return "SOON";
      return "UPCOMING";
    }
    return "ENDED";
  }

  // 2️⃣ generic session (darts / tournaments)
  const session = deriveSessionWindow(e);
  if (session) {
    if (now >= session.start && now <= session.end) return "LIVE";
    if (session.start > now) {
      const diffMs = session.start.getTime() - now.getTime();
      if (diffMs <= getSoonWindowMs(e)) return "SOON";
      return "UPCOMING";
    }
    return "ENDED";
  }

  // 3️⃣ normal match
  const raw = e.date ?? e.utcDate ?? e.startDate;
  const start = new Date(raw);
  if (isNaN(start.getTime())) return "ENDED";

  const end = new Date(start.getTime() + getDefaultDurationMs(e));
  const diffMs = start.getTime() - now.getTime();

  if (now >= start && now <= end) return "LIVE";
  if (diffMs > 0 && diffMs <= getSoonWindowMs(e)) return "SOON";
  if (diffMs > 0) return "UPCOMING";

  return "ENDED";
}
