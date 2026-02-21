//src/app/ops/components/home/OperationalStatusHeader.tsx

"use client";

import { useState } from "react";
import type { PeakScope } from "@/types/infra";
import type { AttentionLevel } from "@/lib/infra/attentionLevel";

type Props = {
  peak: { hour: number; count: number } | null;
  scope: PeakScope;
  dateLabel: string;
  operationalSignal: string | null;
  attentionLevel: AttentionLevel | null;
};

/* =========================
   Helpers
========================= */

function formatScope(scope: PeakScope) {
  if (scope.type === "city") return `${scope.name} area`;
  if (scope.type === "region") return `${scope.name} footprint`;
  return "Portfolio-wide";
}

function levelStyle(level: AttentionLevel) {
  if (level === "high") {
    return {
      badge: "bg-red-500/20 text-red-700",
      label: "HIGH ATTENTION",
    };
  }
  if (level === "medium") {
    return {
      badge: "bg-amber-500/20 text-amber-700",
      label: "MODERATE ATTENTION",
    };
  }
  return {
    badge: "bg-muted text-muted-foreground",
    label: "LOW ATTENTION",
  };
}

/* =========================
   Component
========================= */

export default function OperationalStatusHeader({
  peak,
  scope,
  dateLabel,
  operationalSignal,
  attentionLevel,
}: Props) {
  const [open, setOpen] = useState(false);

  // 🔕 완전히 중요하지 않은 날은 표시 안 함
  if (!peak || !attentionLevel || attentionLevel === "low") {
    return null;
  }

  const windowLabel = `${peak.hour}:00–${peak.hour + 1}:00`;
  const scopeLabel = `${formatScope(scope)} · ${dateLabel}`;
  const style = levelStyle(attentionLevel);

  return (
    <div className="fixed top-[108px] left-95 z-[60] hidden md:block">
      {/* =========================
          COLLAPSED (default)
      ========================= */}
      <button
        onClick={() => setOpen(true)}
        className="
          group
          flex items-center gap-2
          rounded-full
          bg-background/80 backdrop-blur
          ring-1 ring-border/40
          px-3 py-1.5
          text-xs font-medium
          hover:bg-background
          transition
        "

        aria-label="Open operational status"
      >
        <span className="font-semibold">
          Peak overlap {windowLabel}
        </span>

        <span
          className={[
            "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
            style.badge,
          ].join(" ")}
        >
          {attentionLevel.toUpperCase()}
        </span>

        <span
          className="
            ml-1
            text-muted-foreground
            opacity-50
            transition
            group-hover:opacity-100
          "
        >
          ›
        </span>
      </button>

      {/* =========================
          EXPANDED
      ========================= */}
      {open && (
        <>
          {/* click-away */}
          <button
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-label="Close operational status"
          />

          <div
            className="
              relative z-50 mt-2
              w-[340px]
              rounded-2xl
              bg-background/95 backdrop-blur
              ring-1 ring-border/40
              px-4 py-4
              shadow-xl
            "
          >
            {/* Header */}
            <div className="mb-3 text-center">
              <p className="text-xs text-muted-foreground tracking-wide">
                Operational focus window
              </p>
              
              <p className="text-base font-semibold">
                {windowLabel}
                <span className="mx-2 text-muted-foreground">·</span>
                {peak.count} concurrent events
              </p>

              {peak.count >= 5 && (
                <p className="text-xs text-center text-red-600 mt-2">
                  Concurrent scheduling density above normal range
                </p>
              )}

              <p className="text-[11px] text-muted-foreground">
                {scopeLabel}
              </p>
            </div>

            {/* Signal sentence (핵심 요약) */}
            {operationalSignal && (
              <p className="mb-3 text-xs text-muted-foreground text-center">
                {operationalSignal}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
