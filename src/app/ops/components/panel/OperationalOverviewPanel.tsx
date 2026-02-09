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

type ScopeScale = {
  maxPerHour: number;
};

const SCALE_BY_SCOPE: Record<
  "city" | "region" | "all",
  ScopeScale
> = {
  city:   { maxPerHour: 10 },
  region: { maxPerHour: 40 },
  all:    { maxPerHour: 80 },
};


export type OperationalPanelProps = {
  activeDate: Date;    
  dateLabel: string;
  showMovement?: boolean;
  scopeLabel: string; // ✅ 추가
  scopeType: "city" | "region" | "all";
  criticalWindow: {
    from: string;
    to: string;
  } | null;

  riskSummary: {
    low: number;
    medium: number;
    high: number;
  };
  movementSummary: {
    peakMinute: number | null;
    peakValue: number;
    window: {
      start: number;
      end: number;
    } | null;
  };

  hourlyImpact: {
    hour: number;
    value: number;
    level: AttentionLevel;
  }[];

  factors: Factor[];
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

function levelLabel(level: AttentionLevel) {
  return level.toUpperCase();
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
  criticalWindow,
  hourlyImpact,
  factors,
  scopeLabel,
  scopeType, 
  activeDate,
  movementSummary, 
  showMovement,
}: OperationalPanelProps) {

  const eventPeak =
  hourlyImpact.length > 0
    ? hourlyImpact.reduce(
        (max, h) => (h.value > max.value ? h : max),
        hourlyImpact[0]
      )
    : null;

  const eventPeakHour = eventPeak?.hour ?? null;
  const { peakMinute, peakValue } = movementSummary;

  const hasMovement = peakMinute !== null;
  const hasWindow = movementSummary.window !== null;

  const totalEvents = hourlyImpact.reduce(
    (sum, h) => sum + h.value,
    0
  );

  const hasAnyEvents = totalEvents > 0;

  const movementLevel =
    peakValue >= 3.5
      ? "high"
      : peakValue >= 1.5
      ? "medium"
      : "low";

  function formatMinute(minute: number) {
    const h = Math.floor(minute / 60);
    const m = minute % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  }

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
          Live sports event overview
        </p>

        <p className="text-sm font-semibold leading-tight">
          {scopeLabel}
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
            movementLevel === "high"
              ? "from-red-500/90 to-red-600 text-white"
              : movementLevel === "medium"
              ? "from-amber-400/90 to-amber-500 text-white"
              : "from-emerald-400/90 to-emerald-500 text-white",
            "shadow-md",
          ].join(" ")}
        >
          <p className="text-[11px] uppercase tracking-wide opacity-80">
            Today at a glance
          </p>

          <p className="text-lg font-semibold leading-tight">
            {movementLevel === "high"
              ? "High concentration of sports events today"
              : movementLevel === "medium"
              ? "Moderate level of sports event activity"
              : "Low level of sports event activity"}

          </p>

          {eventPeakHour !== null && (
            <p className="text-xs opacity-90 mt-1">
              Peak around <strong>{eventPeakHour}:00</strong> ·{" "}
              {eventPeak?.value ?? 0} events
            </p>
          )}
        </div>

        {/* =====================
            MOVEMENT ALERT
        ===================== */}
        {showMovement !== false && (
          <div className="rounded-2xl bg-muted/40 p-4 min-h-[96px] flex flex-col justify-center space-y-2 shadow-sm">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Movement
            </p>
            <p className="text-sm font-medium">
              Modeled crowd movement patterns (event-based)
            </p>


            {!hasAnyEvents ? (
              <p className="text-sm text-muted-foreground italic">
                No events scheduled for this day
              </p>
            ) : !hasMovement || peakValue < 1 ? (
              <p className="text-sm text-muted-foreground">
                No notable crowd movement expected under current event schedules
              </p>

            ) : (
              <>
                <p
                  className={[
                    "text-sm font-semibold",
                    movementLevel === "high"
                      ? "text-red-600"
                      : movementLevel === "medium"
                      ? "text-amber-600"
                      : "text-green-600",
                  ].join(" ")}
                >
                  {movementLevel === "high"
                    ? "Elevated movement expected based on scheduled events"
                    : movementLevel === "medium"
                    ? "Moderate movement expected based on scheduled events"
                    : "Low movement expected based on scheduled events"}

                </p>

                {hasWindow && (
                  <p className="text-xs text-muted-foreground">
                    Peak movement window{" "}
                    <strong>
                      {formatMinute(movementSummary.window!.start)} –{" "}
                      {formatMinute(movementSummary.window!.end)}
                    </strong>
                  </p>
                )}
              </>
            )}
          </div>
        )}
        {/* =====================
            EVENT IMPACT BY HOUR
        ===================== */}
        <div className="rounded-2xl bg-muted/40 p-4 h-[160px] flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <p className="text-xs font-medium">
              Event impact by hour
            </p>

            {/* LEGEND */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                1 event
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                2–3
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                4+
              </span>
            </div>
          </div>

          {/* hour labels */}
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1 shrink-0">
            {hourlyImpact.map((h) => (
              <span key={h.hour}>{h.hour}</span>
            ))}
          </div>

          {/* bars area – 고정 */}
          <div className="relative flex-1 flex items-end gap-1 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-border/40" />
            {hourlyImpact.map((h) => {
              const height = getPanelBarHeight(h.value, scopeType);

              return (
                <div key={h.hour} className="relative flex-1 flex justify-end">
                  <div
                    className={[
                      "w-full rounded-sm self-end",
                      barColor(h.value, h.level),
                    ].join(" ")}
                    style={{ height }}
                  />

                  {/* peak label – absolute라서 높이 영향 없음 */}
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

        {/* =====================
            FACTORS
        ===================== */}
        <div className="rounded-2xl bg-muted/30 p-4 h-[120px] flex flex-col">
          {/* 제목 */}
          <p className="mb-2 text-xs font-medium shrink-0">
            {scopeType === "city"
              ? "Detected activity factors"
              : "Contributing factors"}

          </p>

          {/* 리스트 – 반드시 min-h-0 */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <ul className="space-y-2">
              {factors.map((f) => (
                <li
                  key={f.label}
                  className="
                    grid
                    grid-cols-[1fr_40px_72px]
                    items-center
                    gap-3
                    text-xs
                  "
                >
                  <span className="truncate">{f.label}</span>

                  <span className="text-right text-muted-foreground">
                    {f.count}
                  </span>

                  <span className="flex items-center justify-end">
                    <span className={["w-2 h-2 rounded-full", levelDot(f.level)].join(" ")} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* =====================
            MAP OVERVIEW (PLACEHOLDER)
        ===================== */}
        <div className="rounded-2xl bg-muted/20 p-4 h-[120px] flex flex-col">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Spatial overview
            </p>
          </div>

          <ul className="mt-3 text-xs text-muted-foreground list-disc pl-4 space-y-1.5">
            <li>Event clusters highlighted on map</li>
            <li>Overlapping venues within scope</li>
            <li>Areas of higher event density</li>

          </ul>

          <p className="mt-auto pt-2 text-[10px] italic text-muted-foreground leading-relaxed">
            Spatial patterns are estimated using scheduled event locations
            and historical crowd movement models.

          </p>
        </div>

      </div>  
    </aside>
  );
}
