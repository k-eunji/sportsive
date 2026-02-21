// src/app/ops/components/panel/OperationalOverviewPanel.tsx
"use client";

import type { AttentionLevel } from "@/lib/infra/attentionLevel";

/* =====================
   Types
===================== */

type Factor = {
  label: string;
  count: number;
  level: AttentionLevel;
};

export type OperationalPanelProps = {
  activeDate: Date;    
  dateLabel: string;
  activeHour: number | null;
  onHourSelect: (hour: number) => void;
  filterStateLabel: string;
  scopeLabel: string; // ✅ 추가
  scopeType: "city" | "region" | "all";
  hourlyImpact: {
    hour: number;
    value: number;
    level: AttentionLevel;
  }[];

  baselineStats?: {
    todayCount: number;
    median: number;
    delta: number;
    absoluteDiff: number;
    label: "normal" | "elevated" | "unusual";
  } | null;

  sevenDayTrend?: {
    date: string;
    count: number;
  }[];

  factors: Factor[];
  sports: {
    sport: string;
    count: number;
    emoji: string;
  }[];
  regions: {
    label: string;
    count: number;
  }[];
};

/* =====================
   Helpers
===================== */

function levelDot(level: AttentionLevel) {
  if (level === "high") return "bg-red-500";
  if (level === "medium") return "bg-amber-400";
  return "bg-green-500";
}

function barColor(
  value: number,
  level: AttentionLevel
) {
  if (value <= 0) return "bg-transparent";

  if (level === "high") return "bg-red-500";
  if (level === "medium") return "bg-amber-400";
  return "bg-green-400";
}


function getPanelBarHeight(
  value: number,
  scopeType: "city" | "region" | "all"
) {
  if (value <= 0) return 2;

  // 🔥 최소 가시성 보장
  if (value === 1) return 18;

  if (scopeType === "city") {
    if (value < 3) return 26;
    if (value < 5) return 36;
    return 48;
  }

  if (scopeType === "region") {
    if (value < 4) return 18;
    if (value < 8) return 28;
    if (value < 15) return 40;
    return 56;
  }

  // all
  if (value < 8) return 18;
  if (value < 15) return 28;
  if (value < 30) return 44;
  return 60;
}

function formatHeaderDate(
  activeDate: Date,
  dateLabel: string
) {
  const today = new Date();
  const isToday =
    activeDate.toDateString() === today.toDateString();

  const weekday = activeDate.toLocaleDateString(undefined, {
    weekday: "short",
  });

  const tail = isToday
    ? "Today"
    : activeDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

  return { weekday, tail };
}


/* =====================
   Component
===================== */

export default function OperationalOverviewPanel({
  dateLabel,
  hourlyImpact,
  factors,
  sports,
  regions,
  scopeType,
  activeDate,
  filterStateLabel,
  activeHour,        // ✅ 추가
  onHourSelect, 
  baselineStats,
  sevenDayTrend,
}: OperationalPanelProps){

  const eventPeak =
  hourlyImpact.length > 0
    ? hourlyImpact.reduce(
        (max, h) => (h.value > max.value ? h : max),
        hourlyImpact[0]
      )
    : null;

  const eventPeakHour = eventPeak?.hour ?? null;

  const totalEvents = hourlyImpact.reduce(
    (sum, h) => sum + h.value,
    0
  );

  const peakValue = eventPeak ? eventPeak.value : 0;

  const totalFactorCount = factors.reduce(
    (sum, f) => sum + f.count,
    0
  );

  const totalRegionCount = regions.reduce(
    (sum, r) => sum + r.count,
    0
  );

  const totalSportCount = sports.reduce(
    (sum, s) => sum + s.count,
    0
  );

  const activityLevel =
    peakValue >= 4
      ? "high"
      : peakValue >= 2
      ? "medium"
      : "low";

  const { weekday, tail } = formatHeaderDate(activeDate, dateLabel);

  return (
    <aside
      className="
        w-[360px]
        shrink-0
        h-full
        bg-background
        overflow-hidden
        flex flex-col
        shadow-[4px_0_24px_rgba(0,0,0,0.06)]
        z-10
      "
    >

      {/* HEADER – 고정 */}
      <div className="px-4 py-4 shrink-0 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          UK Sports Activity Intelligence
        </p>

        <p className="text-sm font-semibold leading-tight">
          {filterStateLabel}
        </p>

          <p className="text-xs text-muted-foreground">
            {weekday} · {tail}
          </p>
        </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* =====================
            TODAY SUMMARY (NEW)
        ===================== */}
        <div
          className={[
            "rounded-2xl p-4",
            "bg-gradient-to-br",
            activityLevel === "high"
              ? "from-red-500/90 to-red-600 text-white"
              : activityLevel === "medium"
              ? "from-amber-400/90 to-amber-500 text-white"
              : "from-emerald-400/90 to-emerald-500 text-white",
            "shadow-md",
          ].join(" ")}
        >
          <p className="text-[11px] uppercase tracking-wide opacity-80">
            Today at a glance
          </p>

          <p className="text-lg font-semibold leading-tight">
            {activityLevel === "high"
              ? "Elevated operational pressure expected"
              : activityLevel === "medium"
              ? "Moderate operational load"
              : "Light operational load"}
          </p>

          {eventPeakHour !== null && (
            <p className="text-xs opacity-90 mt-1">
              Peak around <strong>{eventPeakHour}:00</strong> ·{" "}
              {peakValue} events
            </p>
          )}

          {eventPeakHour !== null && peakValue >= 3 && (
            <p className="text-xs opacity-90">
              Multi-event overlap likely during peak window
            </p>
          )}

          {baselineStats && (
            <div className="mt-3 text-xs space-y-1">
              <div>
                <span className="font-medium">
                  {baselineStats.todayCount}
                </span>{" "}
                events today
              </div>

              <div className="text-white/80">
                Typical day:{" "}
                <span className="font-medium">
                  {baselineStats.median}
                </span>{" "}
                events
              </div>

              <div className="text-white/80">
                {baselineStats.delta > 0 && (
                  <>
                    +{baselineStats.delta}% vs typical day
                    {" · "}
                    +{baselineStats.absoluteDiff} events
                  </>
                )}

                {baselineStats.delta < 0 && (
                  <>
                    {baselineStats.delta}% vs typical day
                    {" · "}
                    {Math.abs(baselineStats.absoluteDiff)} fewer events
                  </>
                )}

                {baselineStats.delta === 0 && (
                  <>In line with typical activity</>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =====================
            EVENT IMPACT BY HOUR
        ===================== */}
        <div className="rounded-2xl bg-muted/40 p-4 h-[160px] flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <p className="text-xs font-medium">
              Event concurrency timeline
            </p>

            {/* LEGEND */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                1 event
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                2–4
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                5+
              </span>
            </div>
          </div>

          {/* hour labels */}
          <div className="relative flex-1 flex items-end gap-1 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-border/40" />

            {hourlyImpact.map((h) => {
              const height = getPanelBarHeight(h.value, scopeType);
              const isActive = activeHour === h.hour;

              return (
                <div
                  key={h.hour}
                  onClick={() => onHourSelect(h.hour)}
                  className={[
                    "relative flex-1 flex justify-end cursor-pointer",
                    isActive ? "ring-2 ring-red-400 rounded-sm" : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "w-full rounded-sm self-end",
                      barColor(h.value, h.level),
                    ].join(" ")}
                    style={{ height }}
                  />

                  {eventPeakHour === h.hour && (
                    <span
                      className="
                        absolute
                        -top-3
                        left-1/2
                        -translate-x-1/2
                        text-[10px]
                        text-muted-foreground
                        whitespace-nowrap
                      "
                    >
                      ↑ peak
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {sevenDayTrend && (
          <div className="rounded-2xl bg-muted/30 p-4">
            <p className="mb-2 text-xs font-medium">
              7-day activity trend
            </p>

            <div className="flex flex-col">

              {/* 막대 그래프 */}
              <div className="flex items-end gap-2 h-[60px]">
                {sevenDayTrend.map((d, index) => {
                  const max = Math.max(
                    ...sevenDayTrend.map(t => t.count),
                    1
                  );

                  const height = (d.count / max) * 100;
                  const isToday =
                    index === sevenDayTrend.length - 1;

                  return (
                    <div
                      key={d.date}
                      className={[
                        "flex-1 rounded-sm",
                        isToday
                          ? "bg-red-500"
                          : "bg-blue-500/70",
                      ].join(" ")}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>

              {/* 날짜 라벨 */}
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                {sevenDayTrend.map((d, index) => {
                  const date = new Date(d.date);
                  const day = date.getDate();
                  const isToday =
                    index === sevenDayTrend.length - 1;

                  return (
                    <span
                      key={d.date}
                      className={
                        isToday
                          ? "text-red-500 font-medium"
                          : ""
                      }
                    >
                      {isToday ? "Today" : day}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {/* =====================
            FACTORS
        ===================== */}
        <div className="rounded-2xl bg-muted/30 p-4 h-[120px] flex flex-col">
          {/* 제목 */}
          <p className="mb-2 text-xs font-medium shrink-0">
            {scopeType === "city"
              ? `Detected activity factors (${factors.length})`
              : `Competition mix (${factors.length} competitions)`}
          </p>

          {/* 리스트 – 반드시 min-h-0 */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          
            {factors.map((f) => (
              <li
                key={f.label}
                className="
                  grid
                  grid-cols-[1fr_60px]
                  items-center
                  gap-2
                  text-xs
                "
              >
                <span className="truncate">{f.label}</span>

                <span className="text-right text-muted-foreground">
                  {f.count}
                  {totalFactorCount > 0 && (
                    <span className="ml-1 text-[10px] opacity-70">
                      ({Math.round((f.count / totalFactorCount) * 100)}%)
                    </span>
                  )}
                </span>

                <span className="flex items-center justify-end">

                </span>
              </li>
            ))}
            
          </div>
        </div>

        {/* =====================
            EVENTS BY LOCATION
        ===================== */}
        <div className="rounded-2xl bg-muted/30 p-4">
          <p className="mb-2 text-xs font-medium">
            Events by location ({regions.length} cities)
          </p>

          <div
            className={regions.length > 3 ? "max-h-[96px] overflow-y-auto pr-1" : ""}
          >
            <div className="space-y-2">
              {regions.map((r) => {
                const max = regions[0]?.count ?? 1;
                const width = Math.max(8, (r.count / max) * 100);

                return (
                  <div key={r.label} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="truncate">{r.label}</span>
                      <span className="text-muted-foreground">
                        {r.count}
                        {totalRegionCount > 0 && (
                          <span className="ml-1 text-[10px] opacity-70">
                            ({Math.round((r.count / totalRegionCount) * 100)}%)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="h-1.5 bg-border rounded-full">
                      <div
                        className="h-full bg-blue-500/70 rounded-full"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* =====================
            EVENTS BY SPORT
        ===================== */}
        <div
          className={[
            "rounded-2xl bg-muted/30 p-4 flex flex-col",
            sports.length > 3 ? "h-[120px]" : "",
          ].join(" ")}
        >
          <p className="mb-2 text-xs font-medium shrink-0">
            Events by sport ({sports.length} sports)
          </p>   
          <div
            className={[
              "flex-1 min-h-0",
              sports.length > 3 ? "overflow-y-auto pr-1" : "",
            ].join(" ")}
          >
            <div className="space-y-2">
              {sports.map((s) => {
                const max = sports[0]?.count ?? 1;
                const width = Math.max(8, (s.count / max) * 100);

                return (
                  <div key={s.sport} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="flex items-center gap-1">
                        <span>{s.emoji}</span>
                        <span className="capitalize">
                          {s.sport.replace("-", " ")}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        {s.count}
                        {totalSportCount > 0 && (
                          <span className="ml-1 text-[10px] opacity-70">
                            ({Math.round((s.count / totalSportCount) * 100)}%)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="h-1.5 bg-border rounded-full">
                      <div
                        className="h-full bg-foreground/70 rounded-full"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>  
    </aside>
  );
}
