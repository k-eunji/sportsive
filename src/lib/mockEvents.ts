// src/lib/mockEvents.ts
export type MockEvent = {
  id: string;
  title: string;
  sport: string;
  city: string;
  region: string; // UK region or country bucket
  startISO: string; // start time ISO
  venue?: string;
  homepageUrl?: string;
  isPaid?: boolean;
};

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: "e1",
    title: "Arsenal vs Tottenham",
    sport: "football",
    city: "London",
    region: "UK",
    startISO: "2026-01-31T17:30:00Z",
    venue: "Emirates Stadium",
    homepageUrl: "https://www.arsenal.com",
    isPaid: true,
  },
  {
    id: "e2",
    title: "Harlequins vs Saracens",
    sport: "rugby",
    city: "London",
    region: "UK",
    startISO: "2026-02-01T15:00:00Z",
    venue: "Twickenham Stoop",
    homepageUrl: "https://www.quins.co.uk",
    isPaid: true,
  },
  {
    id: "e3",
    title: "PDC Darts Night Session",
    sport: "darts",
    city: "London",
    region: "UK",
    startISO: "2026-01-30T19:00:00Z",
    venue: "Alexandra Palace",
    homepageUrl: "https://www.pdc.tv",
    isPaid: true,
  },
  {
    id: "e4",
    title: "Ascot Race Meeting",
    sport: "horse-racing",
    city: "Ascot",
    region: "UK",
    startISO: "2026-01-31T12:00:00Z",
    venue: "Ascot Racecourse",
    homepageUrl: "https://www.ascot.com",
    isPaid: true,
  },
  {
    id: "e5",
    title: "London Tennis Session",
    sport: "tennis",
    city: "London",
    region: "UK",
    startISO: "2026-02-01T11:00:00Z",
    venue: "Local Courts (Example)",
    homepageUrl: "https://www.lta.org.uk",
    isPaid: false,
  },
];

// -------- scope helpers --------

export type Scope = "today" | "tomorrow" | "weekend" | "week";

export function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function nextWeekendRange(now: Date) {
  const base = startOfLocalDay(now);
  const day = base.getDay(); // 0 Sun ... 6 Sat
  const toSat = day === 6 ? 0 : (6 - day + 7) % 7;
  const sat = new Date(base);
  sat.setDate(sat.getDate() + toSat);
  const mon = new Date(sat);
  mon.setDate(mon.getDate() + 2);
  return { start: sat, end: mon };
}

export function getDefaultScope(now: Date): Scope {
  // ✅ “금요일 저녁~주말” 기본값을 weekend로
  const day = now.getDay(); // 0 Sun ... 6 Sat
  const hour = now.getHours();

  // Thu(4)부터 "주말 뭐하지" 모드가 켜지는 패턴
  if (day === 4) return "weekend";

  // Fri(5) 16:00 이후는 weekend
  if (day === 5 && hour >= 16) return "weekend";

  // Sat(6), Sun(0)는 today (바로 오늘 할 일)
  if (day === 6 || day === 0) return "today";

  // Mon~Wed는 week로
  return "week";
}

export function inScope(start: Date, scope: Scope, now: Date) {
  const base = startOfLocalDay(now);

  if (scope === "today") {
    const end = new Date(base);
    end.setDate(end.getDate() + 1);
    return start >= now && start < end;
  }

  if (scope === "tomorrow") {
    const t0 = new Date(base);
    t0.setDate(t0.getDate() + 1);
    const t1 = new Date(t0);
    t1.setDate(t1.getDate() + 1);
    return start >= t0 && start < t1;
  }

  if (scope === "weekend") {
    const wk = nextWeekendRange(now);
    return start >= wk.start && start < wk.end;
  }

  // week
  const end = new Date(base);
  end.setDate(end.getDate() + 7);
  return start >= now && start < end;
}
