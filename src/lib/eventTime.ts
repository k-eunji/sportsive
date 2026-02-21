// src/lib/eventTime.ts

import { resolveEventBehavior } from "@/lib/resolveEventBehavior";

export type EventTimeState =
  | "LIVE"
  | "SOON"
  | "UPCOMING"
  | "ENDED";

/* =========================
   🏏 CRICKET (FIRST CLASS)
========================= */
function deriveCricketFirstClassWindow(e: any): {
  start: Date;
  end: Date;
} | null {
  if (e.sport !== "cricket") return null;
  if (e.kind !== "first_class") return null;

  const raw = e.date ?? e.startDate;
  if (!raw) return null;

  const base = new Date(raw);
  if (isNaN(base.getTime())) return null;

  const start = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    10,
    30,
    0,
    0
  );

  const end = new Date(start);
  end.setDate(end.getDate() + 1);   // ⬅️ 하루 span
  end.setHours(18, 30, 0, 0);

  return { start, end };
}



/* =========================
   기본 지속시간 (match용)
========================= */
export function getDefaultDurationMs(e: {
  durationMs?: number;
  sport?: string;
  kind?: string;
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

    case "cricket":
      if (e.kind === "t20") {
        return 3.5 * 60 * 60 * 1000;
      }
      if (e.kind === "one_day") {
        return 8 * 60 * 60 * 1000;
      }
      return 7 * 60 * 60 * 1000;

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
    case "cricket":
      return 3 * 60 * 60 * 1000;  
    default:
      return 2 * 60 * 60 * 1000;
  }
}

/* =========================
   🟣 GENERIC SESSION WINDOW
========================= */
function deriveSessionWindow(e: any): { start: Date; end: Date } | null {
  if (e.kind !== "session") return null;
  if (!e.startDate) return null;

  const start = new Date(e.startDate);
  const end = new Date(e.endDate ?? e.startDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

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
function deriveHorseRacingSessionWindow(e: any): {
  start: Date;
  end: Date;
} | null {
  if (e.sport !== "horse-racing") return null;

  const label =
    e.payload?.sessionTime?.toLowerCase?.() ??
    e.sessionTime?.toLowerCase?.() ??
    "";

  let baseRaw = e.date ?? e.startDate;
  if (!baseRaw) return null;

  if (typeof baseRaw === "string" && baseRaw.includes(" ") && !baseRaw.includes("T")) {
    baseRaw = baseRaw.replace(" ", "T");
  }

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

  const behavior = resolveEventBehavior(e);

  // 🟤 DAY-SPAN EVENT (ex. first-class cricket)
  if (behavior.timeModel === "day_span") {
    const win = deriveCricketFirstClassWindow(e);
    if (win) {
      if (now >= win.start && now <= win.end) return "LIVE";
      if (win.start > now) {
        const diffMs = win.start.getTime() - now.getTime();
        if (diffMs <= getSoonWindowMs(e)) return "SOON";
        return "UPCOMING";
      }
      return "ENDED";
    }
  }

  // 🐎 horse racing
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

  // 🟣 generic session
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

  // ⚽ default fixed match
  let raw = e.startAtUtc ?? e.date ?? e.utcDate ?? e.startDate;
  if (!raw) return "ENDED";

  // 🔥 "YYYY-MM-DD HH:mm:ss" → ISO 변환
  if (typeof raw === "string" && raw.includes(" ") && !raw.includes("T")) {
    raw = raw.replace(" ", "T");
  }

  const start = new Date(raw);
  if (isNaN(start.getTime())) return "ENDED";

  const end = new Date(start.getTime() + getDefaultDurationMs(e));
  const diffMs = start.getTime() - now.getTime();

  if (now >= start && now <= end) return "LIVE";
  if (diffMs > 0 && diffMs <= getSoonWindowMs(e)) return "SOON";
  if (diffMs > 0) return "UPCOMING";

  return "ENDED";
}
