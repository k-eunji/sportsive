//src/app/ops/components/home/DatePresetBar.tsx

"use client";

import { useMemo } from "react";

type Props = {
  activeDate: Date;
  onChange: (d: Date) => void;
  maxDays?: number;
  disabled?: boolean; // timeOpen 전달용
};

/* =========================
   HELPERS
========================= */

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function nextSaturday(now: Date) {
  const d = startOfDay(now);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
  return d;
}

function nextSunday(now: Date) {
  const d = startOfDay(now);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  return d;
}

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/* =========================
   COMPONENT
========================= */

export default function DatePresetBar({
  activeDate,
  onChange,
  maxDays,
  disabled,
}: Props) {
  const today = startOfDay(new Date());
  const sat = useMemo(() => nextSaturday(today), [today]);
  const sun = useMemo(() => nextSunday(today), [today]);

  const btn = (label: string, date: Date) => (
    <button
      key={label}
      type="button"
      onClick={() => onChange(date)}
      className={[
        "px-2 py-1 text-[11px] font-medium rounded-full transition",
        isSameDay(activeDate, date)
          ? "bg-transparent text-foreground"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="inline-flex items-center gap-1">
      <div className="inline-flex items-center gap-1">
        {btn("Today", today)}
        {btn("Sat", sat)}
        {btn("Sun", sun)}
      </div>
      {/* 📅 Calendar (iOS-safe) */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        <span className="pointer-events-none">📅</span>

        {/* 🔥 핵심: Time 열려 있으면 input 자체를 DOM에서 제거 */}
        {!disabled && (
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer"
            value={toInputDate(activeDate)}
            min={toInputDate(today)}
            max={
              maxDays
                ? toInputDate(
                    new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate() + maxDays
                    )
                  )
                : undefined
            }
            onChange={(e) => {
              if (!e.target.value) return;
              onChange(startOfDay(new Date(e.target.value)));
            }}
          />
        )}
      </div>
    </div>
  );
}
