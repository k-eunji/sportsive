// src/app/sport/_components/HorseRacingSportPage.tsx

"use client";

import Link from "next/link";
import { useMemo } from "react";
import HorseRacingCalendar2026 from "./HorseRacingCalendar2026";
import HorseRacingBusiestDays2026 from "./HorseRacingBusiestDays2026";
import HorseRacingCourseRanking2026 from "./HorseRacingCourseRanking2026";
import HorseRacingOverview from "./HorseRacingOverview";
import HorseRacingNext60Density from "./HorseRacingNext60Density";
import HorseRacingOverlapReport2026 from "./HorseRacingOverlapReport2026";
import HorseRacingCourseDetail from "./HorseRacingCourseDetail";

const UK_REGIONS = [
  "england",
  "scotland",
  "wales",
  "northern ireland",
];

export default function HorseRacingSportPage({
  events,
  tab,
  course,
}: {
  events: any[];
  tab: string;
  course: string | null;
}) {
  /* ======================================================
     UK 2026 FILTER
  ====================================================== */

  const uk2026 = useMemo(() => {
    return events.filter((e: any) => {
      const year = (e.startDate ?? "").slice(0, 4);
      return (
        year === "2026" &&
        UK_REGIONS.includes(e.region?.toLowerCase())
      );
    });
  }, [events]);

  /* ======================================================
     COURSE RANKING
  ====================================================== */

  const venueMap: Record<string, number> = {};
  uk2026.forEach((e: any) => {
    if (!e.venue) return;
    venueMap[e.venue] = (venueMap[e.venue] || 0) + 1;
  });

  const sortedCourses = Object.entries(venueMap).sort(
    (a, b) => b[1] - a[1]
  );

  /* ======================================================
     BUSIEST DAYS
  ====================================================== */


  /* ======================================================
     OVERLAP REPORT
  ====================================================== */

  const sessionMap: Record<string, number> = {};
  uk2026.forEach((e: any) => {
    const s = e.sessionTime || "Unknown";
    sessionMap[s] = (sessionMap[s] || 0) + 1;
  });

  const sortedSessions = Object.entries(sessionMap).sort(
    (a, b) => b[1] - a[1]
  );

  /* ======================================================
     NEXT 60 DAYS
  ====================================================== */

  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 60);

  const upcoming = events.filter((e: any) => {
    const d = new Date(e.startDate);
    return d >= today && d <= future;
  });

  /* ======================================================
     MONTHLY 2026
  ====================================================== */

  const monthMap: Record<string, number> = {};
  uk2026.forEach((e: any) => {
    const m = (e.startDate ?? "").slice(0, 7);
    monthMap[m] = (monthMap[m] || 0) + 1;
  });

  const sortedMonths = Object.entries(monthMap).sort();

  /* ======================================================
     TABS NAV
  ====================================================== */

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "calendar", label: "Calendar 2026" },
    { key: "busiest", label: "Busiest Days" },
    { key: "courses", label: "Course Ranking" },
    { key: "overlap", label: "Overlap Report" },
    { key: "next60", label: "Next 60 Days" },
  ];

  const allowedTabs = [
    "overview",
    "calendar",
    "busiest",
    "courses",
    "overlap",
    "next60",
    "course",
  ];
  const currentTab = allowedTabs.includes(tab)
    ? tab
    : "overview";

  let content;

  switch (currentTab) {
    case "overview":
      content = <HorseRacingOverview events={events} />;
      break;

    case "calendar":
      content = <HorseRacingCalendar2026 events={events} />;
      break;

    case "busiest":
      content = <HorseRacingBusiestDays2026 events={events} />;
      break;

    case "courses":
      content = <HorseRacingCourseRanking2026 events={events} />;
      break;

    case "overlap":
      content = <HorseRacingOverlapReport2026 events={events} />;
      break;

    case "next60":
      content = <HorseRacingNext60Density events={events} />;
      break;

    case "course":
      content = (
        <HorseRacingCourseDetail
          slug={course ?? ""}
          events={events}
        />
      );
    break;
  }

  return (
    <div className="space-y-10">

      {/* ===================== TABS ===================== */}

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/sport/horse-racing?tab=${t.key}`}
            className={`px-3 py-1.5 rounded-md text-sm transition
              ${
                tab === t.key
                  ? "bg-black text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div>{content}</div>
    </div>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="border rounded-2xl p-6 bg-white">
      <p className="text-xs uppercase text-muted-foreground">
        {title}
      </p>
      <p className="text-3xl font-semibold mt-2">
        {value}
      </p>
    </div>
  );
}