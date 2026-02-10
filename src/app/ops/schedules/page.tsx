// src/app/ops/schedules/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import type { Event } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";


/* =====================
   Helpers
===================== */


type ListFilter = Set<string>;

type DateRange = {
  start: Date;
  end: Date;
};

type SortKey = "date" | "time" | "competition" | "location" | "concurrent";
type SortDir = "asc" | "desc";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCompetition(e: any) {
  return (
    e.competition ??
    (e.sport
      ? e.sport.charAt(0).toUpperCase() + e.sport.slice(1)
      : "Other")
  );
}

function cityHourKey(e: any) {
  const d = new Date(e.date ?? e.startAtUtc ?? e.startDate);
  return `${e.city ?? "unknown"}-${d.getHours()}:00`;
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getEventDate(e: any) {
  return new Date(e.date ?? e.startAtUtc ?? e.startDate);
}

function HeaderFilter({
  label,
  sortKey,
  sort,  
  setSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; dir: SortDir };
  setSort: React.Dispatch<
    React.SetStateAction<{ key: SortKey; dir: SortDir }>
  >;
}) {
  const [open, setOpen] = useState(false);
  const isSorted = sort.key === sortKey;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={`
            cursor-pointer select-none flex items-center gap-1 px-1 rounded
            text-foreground
            ${open ? "bg-muted/40" : ""}
            ${isSorted ? "font-semibold" : ""}
          `}
        >

          {label}
          <span
            className={`
              text-[10px]
              ${isSorted ? "text-primary" : "text-muted-foreground"}
            `}
          >
            {isSorted ? (sort.dir === "asc" ? "▲" : "▼") : "▼"}
          </span>

        </div>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-2 text-xs bg-background">
        <button
          className="w-full text-left px-2 py-1 hover:bg-muted"
          onClick={() => setSort({ key: sortKey, dir: "asc" })}
        >
          Sort Ascending
        </button>
        <button
          className="w-full text-left px-2 py-1 hover:bg-muted"
          onClick={() => setSort({ key: sortKey, dir: "desc" })}
        >
          Sort Descending
        </button>
      </PopoverContent>
    </Popover>
  );
}

function ListHeaderFilter<T>({
  label,
  options,
  selected,
  setSelected,
}: {
  label: string;
  options: T[];
  selected: Set<T>;
  setSelected: React.Dispatch<React.SetStateAction<Set<T>>>;
}) {
  const [open, setOpen] = useState(false);

  const isActive =
    selected.size > 0 && selected.size < options.length;

  const toggle = (value: T) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(
      selected.size === options.length ? new Set() : new Set(options)
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={`
            cursor-pointer select-none flex items-center gap-1
            ${open ? "bg-muted/40" : ""}
            ${isActive ? "text-foreground font-semibold" : ""}
            px-1 rounded
          `}
        >
          {label}
          <span
            className={`
              text-[10px] transition-transform
              ${open ? "rotate-180" : ""}
              ${isActive ? "text-primary" : ""}
            `}
          >
            ▼
          </span>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-2 text-xs bg-background max-h-64 overflow-auto">
        <label className="flex items-center gap-2 px-1 py-1 font-medium">
          <input
            type="checkbox"
            checked={selected.size === options.length}
            onChange={toggleAll}
          />
          (모두 선택)
        </label>

        {options.map(opt => (
          <label
            key={String(opt)}
            className="flex items-center gap-2 px-1 py-1"
          >
            <input
              type="checkbox"
              checked={selected.has(opt)}
              onChange={() => toggle(opt)}
            />
            {String(opt)}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/* =====================
   Page
===================== */

export default function SchedulesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  
  const [range, setRange] = useState<DateRange | undefined>({
    start: startOfDay(new Date()),
    end: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      23, 59, 59
    ),
  });

  const [sort, setSort] = useState<{
    key: SortKey;
    dir: SortDir;
  }>({
    key: "date",
    dir: "asc",
  });

  const [competitionFilter, setCompetitionFilter] = useState<ListFilter>(new Set());
  const [locationFilter, setLocationFilter] = useState<ListFilter>(new Set());
  const [concurrentFilter, setConcurrentFilter] = useState<Set<number>>(new Set());

  /* =====================
     Load events
  ===================== */
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/events?window=180d");
      const data = await res.json();
      setEvents(data.events ?? []);
    })();
  }, []);

  /* =====================
     Date window filter
  ===================== */
  const visibleEvents = useMemo(() => {
    if (!range) return [];

    const from = range.start.getTime();
    const to = range.end.getTime();

    return events.filter((e: any) => {
      const raw = e.date ?? e.startDate;
      if (!raw) return false;

      const t = new Date(raw).getTime();
      return t >= from && t <= to;
    });

  }, [events, range]);

  /* =====================
     Density by hour
  ===================== */
  const hourDensity = useMemo(() => {
    const map = new Map<string, number>();

    for (const e of visibleEvents as any[]) {
      const key = cityHourKey(e);
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return map;
  }, [visibleEvents]);

  /* =====================
     Group by competition → city
  ===================== */
  const rows = useMemo(() => {
    return [...visibleEvents]
      .filter(e => {
        const comp = getCompetition(e);
        const loc = e.city ?? "—";
        const conc = hourDensity.get(cityHourKey(e)) ?? 0;

        if (competitionFilter.size && !competitionFilter.has(comp)) return false;
        if (locationFilter.size && !locationFilter.has(loc)) return false;
        if (concurrentFilter.size && !concurrentFilter.has(conc)) return false;

        return true;
      })
      .sort((a: any, b: any) => {
        let av: any;
        let bv: any;

        switch (sort.key) {
          case "date":
          case "time":
            av = getEventDate(a).getTime();
            bv = getEventDate(b).getTime();
            break;
          case "competition":
            av = getCompetition(a).toLowerCase();
            bv = getCompetition(b).toLowerCase();
            break;
          case "location":
            av = (a.city ?? "").toLowerCase();
            bv = (b.city ?? "").toLowerCase();
            break;
          case "concurrent":
            av = hourDensity.get(cityHourKey(a)) ?? 0;
            bv = hourDensity.get(cityHourKey(b)) ?? 0;
            break;
        }

        if (av < bv) return sort.dir === "asc" ? -1 : 1;
        if (av > bv) return sort.dir === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    visibleEvents,
    sort.key,
    sort.dir,
    hourDensity,
    competitionFilter,
    locationFilter,
    concurrentFilter,
  ]);

  const competitionOptions = useMemo(() => {
    return Array.from(
      new Set(visibleEvents.map(e => getCompetition(e)))
    ).sort();
  }, [visibleEvents]);

  const locationOptions = useMemo(() => {
    return Array.from(
      new Set(visibleEvents.map(e => e.city ?? "—"))
    ).sort();
  }, [visibleEvents]);

  const concurrentOptions = useMemo(() => {
    return Array.from(
      new Set(
        visibleEvents.map(e => hourDensity.get(cityHourKey(e)) ?? 0)
      )
    ).sort((a, b) => a - b);
  }, [visibleEvents, hourDensity]);

  /* =====================
     Render
  ===================== */

  return (
    <main className="w-full px-4 py-6 space-y-6">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">
          Operational schedule
        </h1>
        <p className="text-sm text-muted-foreground">
          Chronological reference of confirmed events.
          No risk or impact indicators applied.
        </p>

      </header>

      <small className="text-xs text-muted-foreground">
        Showing events for selected period
      </small>

      {/* DATE CONTROLS */}
      <div className="flex items-center gap-3 text-sm">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="text-sm">
              Operational window:
              {" "}
              {range
                ? range.start.toLocaleDateString() +
                  (range.end && toDateKey(range.end) !== toDateKey(range.start)
                    ? ` → ${range.end.toLocaleDateString()}`
                    : "")
                : "Select"}
            </Button>

          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: range?.start,
                to: range?.end,
              }}
              onSelect={(r) => {
                if (!r?.from) return;

                setRange({
                  start: startOfDay(r.from),
                  end: r.to
                    ? new Date(r.to.getFullYear(), r.to.getMonth(), r.to.getDate(), 23, 59, 59)
                    : new Date(r.from.getFullYear(), r.from.getMonth(), r.from.getDate(), 23, 59, 59),
                });
              }}
              initialFocus
            />

          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const d = new Date();
            setRange({
              start: startOfDay(d),
              end: new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                23, 59, 59
              ),
            });
          }}
        >
          Today
        </Button>

      </div>

      {/* EXCEL-LIKE OPERATIONAL TABLE */}
      {rows.length > 0 && (
        <div className="ring-1 ring-border/50 overflow-x-auto">
          {/* TABLE HEADER */}
          <div className="grid grid-cols-[110px_60px_160px_1fr_140px_140px] px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground border-b">
            <HeaderFilter
              label="Date"
              sortKey="date"
              sort={sort}        // ⬅️ 이거 안 넘기면 끝
              setSort={setSort}
            />
            <HeaderFilter
              label="Time"
              sortKey="time"
              sort={sort}        // ⬅️ 이거 안 넘기면 끝
              setSort={setSort}
            />
            <ListHeaderFilter
              label="Competition"
              options={competitionOptions}
              selected={competitionFilter}
              setSelected={setCompetitionFilter}
            />
            <div>Event</div>
            <ListHeaderFilter
              label="Location"
              options={locationOptions}
              selected={locationFilter}
              setSelected={setLocationFilter}
            />

            <ListHeaderFilter
              label="Concurrent"
              options={concurrentOptions}
              selected={concurrentFilter}
              setSelected={setConcurrentFilter}
            />
          </div>

          {/* ROWS */}
          {rows.map((e: any) => {
            const density = hourDensity.get(cityHourKey(e)) ?? 0;
            const d = getEventDate(e);

            return (
              <div
                key={e.id}
                className="grid grid-cols-[110px_60px_160px_1fr_140px_140px] items-center px-3 py-2 text-xs font-mono border-b last:border-b-0"
              >
                {/* Date */}
                <div>
                  {d.toLocaleDateString("en-GB")}
                </div>

                {/* Time */}
                <div className="font-medium">
                  {formatTime(e.date ?? e.startAtUtc ?? e.startDate)}
                </div>

                {/* Competition */}
                <div className="truncate text-muted-foreground">
                  {e.competition ??
                    (e.sport
                      ? e.sport.charAt(0).toUpperCase() + e.sport.slice(1)
                      : "Other")}
                </div>

                {/* Event */}
                <div className="truncate">
                  {e.homeTeam} — {e.awayTeam}
                </div>

                {/* Location */}
                <div className="truncate text-muted-foreground">
                  {e.city ?? "—"}
                </div>

                {/* Concurrent */}
                <div className="text-right text-muted-foreground">
                  {density}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </main>
  );
}
