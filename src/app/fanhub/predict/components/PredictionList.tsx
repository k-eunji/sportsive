//src/app/fanhub/predict/components/PredictionList.tsx

"use client";

import { useEffect, useState } from "react";
import PredictMatchRow from "./PredictMatchRow";
import { useUser } from "@/context/UserContext";  // 추가

export type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  date: string;
};

/** 🇬🇧 영국식 날짜: Thu · 20 Nov */
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const weekday = d.toLocaleString("en-GB", { weekday: "short" });
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "short" });
  return `${weekday} · ${day} ${month}`;
}

/** 날짜별 그룹 */
function groupByDate(matches: Match[]) {
  const groups: Record<string, Match[]> = {};

  for (const m of matches) {
    const key = new Date(m.date).toISOString().slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }

  return Object.entries(groups).sort(([a], [b]) => (a < b ? -1 : 1));
}

export default function PredictionList() {
  const { user } = useUser();
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<
    Record<string, { home: number; draw: number; away: number }>
  >({});


  const [predictions, setPredictions] =
    useState<Record<string, "home" | "draw" | "away">>({});

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/events/england/football");
      const json = await res.json();

      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);

      const threeDaysLater = new Date(now);
      threeDaysLater.setUTCDate(now.getUTCDate() + 3); // 오늘 포함 3일: 20,21,22
      const limitKey = threeDaysLater.toISOString().slice(0, 10);

      // 오늘~3일 뒤 경기만
      const upcoming = json.matches.filter((m: any) => {
        const matchKey = new Date(m.date).toISOString().slice(0, 10);
        return matchKey >= todayKey && matchKey <= limitKey;
      });

      setMatches(upcoming);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadStats() {
      const res = await fetch("/api/fanhub/predict/stats");
      const json = await res.json();
      setStats(json);
    }
    loadStats();
  }, []);
  
  useEffect(() => {
    async function loadPredictions() {
      if (!user) return;

      const res = await fetch("/api/fanhub/predict/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      const json = await res.json();
      setPredictions(json);
    }

    loadPredictions();
  }, [user]);

  const grouped = groupByDate(matches);

  return (
    <div className="space-y-6">
      {grouped.map(([dateKey, list]) => (
        <div key={dateKey}>
          <h2 className="font-bold px-2 text-sm opacity-70 mb-2">
            {formatDate(dateKey)}
          </h2>

          <div className="divide-y divide-[var(--border)]">
            {list.map((m) => (
              <PredictMatchRow
                key={m.id}
                match={m}
                initialChoice={predictions[String(m.id)] ?? null}
                stats={stats[m.id]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
