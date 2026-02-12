//src/app/ops/components/mobile/MobileOpsView.tsx

"use client";

import { useState, useEffect } from "react";
import DatePresetBar from "@/app/ops/components/home/DatePresetBar";
import type { AttentionLevel } from "@/lib/infra/attentionLevel";

type Props = {
  peakHour: number | null;
  peakCount: number;
  scopeLabel: string;
  dateLabel: string;
  onExpandChange?: (v: boolean) => void;
  attentionLevel: AttentionLevel | null;
  hourlyImpact: {
    hour: number;
    value: number;
  }[];

  // 🔥 추가
  activeDate: Date;
  onDateChange: (d: Date) => void;
  hasAnchor: boolean;
  onOpenAnchor: () => void;
};

export default function MobileOpsView({
  peakHour,
  peakCount,
  scopeLabel,
  dateLabel,
  attentionLevel,
  hourlyImpact,
  onExpandChange,
  activeDate,
  onDateChange,
  hasAnchor,
  onOpenAnchor,
}: Props) {

  const [expanded, setExpanded] = useState(false);

  const levelColor =
    attentionLevel === "high"
      ? "from-red-500 to-red-600"
      : attentionLevel === "medium"
      ? "from-amber-400 to-amber-500"
      : "from-emerald-400 to-emerald-500";

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    onExpandChange?.(next);
  };
  
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    setHeight();
    window.addEventListener("resize", setHeight);
    return () => window.removeEventListener("resize", setHeight);
  }, []);


  return (
    <div
      className={`
        md:hidden
        fixed
        inset-x-0
        bottom-14 
        z-40
        transition-all
        duration-300
        ${expanded ? "h-[75vh]" : "h-[180px]"}
      `}
    >

      <div className="h-full bg-background rounded-t-3xl shadow-2xl p-4 flex flex-col">

        {/* Drag handle */}
        <div
          onClick={toggle}
          className="w-10 h-1.5 bg-muted rounded-full mx-auto mb-3 cursor-pointer"
        />

        {/* SUMMARY CARD */}
        <div
          className={`
            rounded-2xl p-4 text-white bg-gradient-to-br ${levelColor}
          `}
        >
          <p className="text-xs uppercase opacity-80">
            {scopeLabel} · {dateLabel}
          </p>

          <p className="text-lg font-semibold mt-1">
            {attentionLevel === "high"
              ? "High overlap expected"
              : attentionLevel === "medium"
              ? "Moderate overlap expected"
              : "Low overlap expected"}
          </p>

          {peakHour !== null && (
            <p className="text-sm opacity-90 mt-1">
              Peak {peakHour}:00 · {peakCount} events
            </p>
          )}
        </div>

        {/* DATE + ANCHOR BAR */}
        <div className="mt-3 flex items-center justify-between">
          <DatePresetBar
            activeDate={activeDate}
            onChange={onDateChange}
            maxDays={60}
          />

          <button
            onClick={onOpenAnchor}
            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-muted/40"
          >
            {hasAnchor ? "Reference set" : "Set reference location"}
          </button>
        </div>


        {/* EXPANDED CONTENT */}
        {expanded && (
          <div className="mt-4 flex-1 overflow-y-auto">

            {/* Mini chart */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">
                Event impact by hour
              </p>

              <div className="flex items-end gap-1 h-24">
                {hourlyImpact.map((h) => (
                  <div
                    key={h.hour}
                    className="flex-1 bg-primary/40 rounded-sm"
                    style={{
                      height: `${Math.max(4, h.value * 10)}px`,
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Tap map markers to inspect overlapping fixtures.
            </p>

          </div>
        )}
      </div>
    </div>
  );
}
