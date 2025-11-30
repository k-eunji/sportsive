//src/app/teams/[teamId]/mom-vote/history/HistoryRow.tsx

"use client";

import { useState } from "react";
import Image from "next/image";

export default function HistoryRow({ mod, teamId }: any) {
  const [open, setOpen] = useState(false);

  const date = new Date(mod.kickoff).toLocaleDateString("en-GB");

  const candidates = mod.candidates ?? [];
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const winner = sorted[0];

  return (
    <div className="border rounded-xl bg-white shadow p-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">{date}</p>
          <p className="text-lg font-semibold">vs {mod.opponent ?? "Unknown"}</p>

          {winner ? (
            <div className="flex items-center gap-2 mt-1">
              {/* Winner Photo */}
              {winner.photoUrl ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={winner.photoUrl}
                    alt={winner.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                  {winner.name.charAt(0)}
                </div>
              )}

              <p className="text-sm text-gray-700">
                MOM: <span className="font-bold">{winner.name}</span>
                {winner.position && (
                  <span className="text-gray-600 ml-1">
                    ({winner.position})
                  </span>
                )}
              </p>
            </div>
          ) : (
            <p className="text-sm mt-1 text-gray-500">No candidates</p>
          )}
        </div>

        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            mod.locked ? "bg-gray-800 text-white" : "bg-green-600 text-white"
          }`}
        >
          {mod.locked ? "Final" : "Live"}
        </span>
      </div>

      {/* MORE BUTTON */}
      {candidates.length > 0 && (
        <button
          onClick={() => setOpen(!open)}
          className="mt-3 text-sm text-blue-600 underline"
        >
          {open ? "Hide" : "+ More"}
        </button>
      )}

      {/* EXPANDED CANDIDATES */}
      {open && (
        <div className="mt-3 space-y-2">
          {candidates.map((c: any) => (
            <div
              key={c.id}
              className="flex justify-between items-center border rounded p-2 bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {/* Candidate photo */}
                {c.photoUrl ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={c.photoUrl}
                      alt={c.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                    {c.name.charAt(0)}
                  </div>
                )}

                <span className="font-semibold">{c.name}</span>
                {c.position && (
                  <span className="text-xs text-gray-500">({c.position})</span>
                )}
              </div>

              <div className="text-sm font-bold">{c.votes} votes</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
