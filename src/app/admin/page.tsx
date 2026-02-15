//src/app/admin/page.tsx

"use client";

import { useEffect, useState, useMemo } from "react";

type Event = {
  id: string;
  sport: string;
  kind?: string;

  homeTeam?: string;
  awayTeam?: string;

  title?: string;
  competition?: string;

  date?: string;
  startDate?: string;
  endDate?: string;

  sessionTime?: string;
  status?: string;
};

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  /* =========================
     LOAD
  ========================= */
  useEffect(() => {
    fetch("/api/events?window=180d")
      .then(res => res.json())
      .then(data => setEvents(data.events ?? []));
  }, []);

  /* =========================
     TODAY CUT
  ========================= */
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const futureOnly = useMemo(() => {
    return events.filter(e => {

      // horse racing → 날짜만 기준
      if (e.sport === "horse-racing") {
        if (!e.startDate) return false;
        const d = new Date(e.startDate);
        d.setHours(0, 0, 0, 0);
        return d >= today;
      }

      const raw = e.date ?? e.startDate;
      if (!raw) return false;

      const d = new Date(raw);
      d.setHours(0, 0, 0, 0);

      return d >= today;
    });
  }, [events, today]);

  /* =========================
     COMPETITION LIST
  ========================= */
  const competitions = useMemo(() => {
    return Array.from(
      new Set(
        futureOnly
          .filter(e =>
            ["football", "basketball", "rugby", "cricket"].includes(e.sport)
          )
          .map(e => e.competition)
          .filter(Boolean)
      )
    );
  }, [futureOnly]);

  /* =========================
     FILTER
  ========================= */
  const filtered = useMemo(() => {
    return futureOnly
      .filter(e => {

        if (sportFilter !== "all" && e.sport !== sportFilter)
          return false;

        if (
          competitionFilter !== "all" &&
          e.competition !== competitionFilter
        )
          return false;

        if (selectedDate) {
          const raw = e.date ?? e.startDate;
          if (!raw) return false;
          const d = new Date(raw).toISOString().slice(0, 10);
          if (d !== selectedDate) return false;
        }

        if (search) {
          const text =
            (e.homeTeam ?? "") +
            (e.awayTeam ?? "") +
            (e.title ?? "") +
            (e.competition ?? "");

          if (!text.toLowerCase().includes(search.toLowerCase()))
            return false;
        }

        return true;
      })
      .sort((a, b) => {
        const da = new Date(a.date ?? a.startDate ?? "").getTime();
        const db = new Date(b.date ?? b.startDate ?? "").getTime();
        return da - db;
      });
  }, [
    futureOnly,
    sportFilter,
    competitionFilter,
    selectedDate,
    search,
  ]);

  const updateEvent = async (
    id: string,
    sport: string,
    payload: any
  ) => {
    await fetch("/api/admin/update-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, sport, ...payload }),
    });
  };

  const normalizeSport = (s?: string) =>
    (s ?? "").toLowerCase().replace(/\s/g, "").replace(/-/g, "");


  return (
    <main className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Admin – Event Editor
      </h1>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3">

        <select
          value={sportFilter}
          onChange={e => {
            setSportFilter(e.target.value);
            setCompetitionFilter("all");
          }}
          className="border px-3 py-2"
        >
          <option value="all">All Sports</option>
          <option value="football">Football</option>
          <option value="basketball">Basketball</option>
          <option value="rugby">Rugby</option>
          <option value="cricket">Cricket</option>
          <option value="tennis">Tennis</option>
          <option value="darts">Darts</option>
          <option value="horse-racing">Horse Racing</option>
        </select>

        {["football", "basketball", "rugby", "cricket"].includes(sportFilter) && (
          <select
            value={competitionFilter}
            onChange={e => setCompetitionFilter(e.target.value)}
            className="border px-3 py-2"
          >
            <option value="all">All Competitions</option>
            {competitions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border px-3 py-2"
        />

        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2"
        />

      </div>

      {/* LIST */}
      <div className="space-y-4">

        {filtered.map(e => (
          <div
            key={e.sport + "-" + e.id}
            className="border p-4 rounded-lg space-y-3"
          >

            {e.homeTeam ? (
              <div className="font-semibold">
                {e.homeTeam} vs {e.awayTeam}
              </div>
            ) : (
              <div className="font-semibold">
                {e.title}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              {e.competition ?? e.sport}
            </div>

            {/* MATCH */}
            {e.kind === "match" && e.date && (
              <input
                type="datetime-local"
                defaultValue={new Date(e.date)
                  .toISOString()
                  .slice(0, 16)}
                className="border px-2 py-1"
                onBlur={(ev) =>
                  updateEvent(e.id, e.sport, {
                    date: new Date(ev.target.value).toISOString(),
                  })
                }
              />
            )}

            {/* SESSION (tennis / darts only) */}
            {["tennis", "darts"].includes(normalizeSport(e.sport)) &&
              e.startDate &&
              e.endDate && (
                <div className="flex gap-3">
                  <input
                    type="date"
                    defaultValue={e.startDate}
                    className="border px-2 py-1"
                    onBlur={(ev) =>
                      updateEvent(e.id, e.sport, {
                        startDate: ev.target.value,
                      })
                    }
                  />
                  <input
                    type="date"
                    defaultValue={e.endDate}
                    className="border px-2 py-1"
                    onBlur={(ev) =>
                      updateEvent(e.id, e.sport, {
                        endDate: ev.target.value,
                      })
                    }
                  />
                </div>
            )}

            {/* HORSE RACING */}
            {normalizeSport(e.sport) === "horseracing" && (
              <div className="flex gap-3">

                <input
                  type="date"
                  defaultValue={
                    e.startDate
                      ? new Date(e.startDate)
                          .toISOString()
                          .slice(0, 10)
                      : ""
                  }
                  className="border px-2 py-1"
                  onBlur={(ev) =>
                    updateEvent(e.id, e.sport, {
                      date: ev.target.value,
                    })
                  }
                />

                <select
                  defaultValue={e.sessionTime}
                  className="border px-2 py-1"
                  onChange={(ev) =>
                    updateEvent(e.id, e.sport, {
                      sessionTime: ev.target.value,
                    })
                  }
                >
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Floodlit">Floodlit</option>
                </select>

              </div>
            )}

          </div>
        ))}

      </div>
    </main>
  );
}
