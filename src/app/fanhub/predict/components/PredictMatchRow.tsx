// src/app/fanhub/predict/components/PredictMatchRow.tsx

"use client";

import { useUser } from "@/context/UserContext";
import { useState, useMemo, useEffect } from "react";
import { Match } from "./PredictionList";

export default function PredictMatchRow({
  match,
  initialChoice,
  stats,
}: {
  match: Match;
  initialChoice: "home" | "draw" | "away" | null;
  stats?: { home: number; draw: number; away: number };
}) {
  const { user } = useUser();
  const [selected, setSelected] = useState(initialChoice);

  /** 🔒 경기 시작 이후부터 잠금 */
  const isLocked = useMemo(() => {
    const matchDate = new Date(match.date);
    const now = new Date();
    return now >= matchDate;
  }, [match.date]);
  
  /** 📊 퍼센트 계산 */
  const total = stats ? stats.home + stats.draw + stats.away : 0;

  const getPct = (count: number) => {
    if (!total) return "0%";
    return Math.round((count / total) * 100) + "%";
  };

  async function handleSelect(choice: "home" | "draw" | "away") {
    if (!user || isLocked) return;

    setSelected(choice);

    await fetch("/api/fanhub/predict/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        matchId: match.id,
        choice,
      }),
    });
  }

  useEffect(() => {
    setSelected(initialChoice);
  }, [initialChoice]);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-3 py-3 px-2">
      
      {/* Home */}
      <div className="flex items-center gap-2 min-w-0">
        <img src={match.homeTeamLogo ?? "/placeholder.png"} className="w-6 h-6" />
        <span className="text-sm truncate max-w-[120px]">{match.homeTeam}</span>
      </div>

      <div className="text-[10px] opacity-50 w-6 text-center">vs</div>

      {/* Away */}
      <div className="flex items-center gap-2 min-w-0 justify-end">
        <span className="text-sm truncate max-w-[120px] text-right">
          {match.awayTeam}
        </span>
        <img src={match.awayTeamLogo ?? "/placeholder.png"} className="w-6 h-6" />
      </div>

      {/* Buttons + Stats */}
      <div className="flex flex-col gap-1 shrink-0 opacity-90 text-center">
        
        {/* Buttons */}
        {isLocked ? (
          <div className="text-xs text-red-500 font-semibold py-[2px]">Finished</div>
        ) : (
          <div className="flex gap-1">
            {(["home", "draw", "away"] as const).map((t, idx) => (
              <button
                key={t}
                onClick={() => handleSelect(t)}
                className={`px-2 py-[2px] border rounded text-xs transition-all
                  ${
                    selected === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-[var(--border)]"
                  }
                `}
              >
                {idx === 0 ? "H" : idx === 1 ? "D" : "A"}
              </button>
            ))}
          </div>
        )}

        {/* Percentages */}
        <div className="text-[10px] opacity-70 flex justify-between w-[80px] mx-auto">
          <span>H {getPct(stats?.home ?? 0)}</span>
          <span>D {getPct(stats?.draw ?? 0)}</span>
          <span>A {getPct(stats?.away ?? 0)}</span>
        </div>

      </div>
    </div>
  );
}
