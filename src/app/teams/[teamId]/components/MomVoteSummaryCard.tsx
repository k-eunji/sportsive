//src/app/teams/[teamId]/components/MomVoteSummaryCard.tsx

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState, useMemo } from "react";
import MOMVoteModule from "@/app/teams/[teamId]/mom-vote/components/MOMVoteModule";
import type { MomVoteModuleType, MOMCandidate } from "@/types";

export default function MomVoteSummaryCard({
  teamId,
  todayMatch,
  nextMatch,
  momMod,
  user,   // ⭐ 추가
}: {
  teamId: string;
  todayMatch: any;
  nextMatch: any;
  momMod: MomVoteModuleType | null | undefined;
  user?: { uid: string } | null;
}) {

  const match = todayMatch ?? nextMatch ?? null;

  const kickoff = useMemo(() => {
    if (!match) return null;
    return match.kickoff ? new Date(match.kickoff) : new Date(match.date);
  }, [match]);

  const endTime = useMemo(() => {
    if (!kickoff) return null;
    return new Date(kickoff.getTime() + 24 * 60 * 60 * 1000);
  }, [kickoff]);

  const isStarted = kickoff && Date.now() >= kickoff.getTime();
  const isClosed = endTime && Date.now() >= endTime.getTime();

  const [open, setOpen] = useState(false);
  const [moduleData, setModuleData] = useState<any>(momMod);

  const [progress, setProgress] = useState(100);
  const [hoursLeft, setHoursLeft] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState("");

  const openModal = async () => {
    if (!moduleData) {
      const res = await fetch(`/api/teams/${teamId}/momvote/module`, {
        cache: "no-store",
      });
      const json = await res.json();
      setModuleData(json.module);
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!isStarted || !endTime) return;

    const tick = () => {
      const diff = endTime.getTime() - Date.now();

      if (diff <= 0) {
        setProgress(0);
        setTimeLeft("Closed");
        setHoursLeft(0);
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
      setHoursLeft(diff / 1000 / 60 / 60);
      setProgress((diff / (24 * 60 * 60 * 1000)) * 100);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isStarted, endTime]);

  if (!match) return null;

  if (momMod === undefined)
    return (
      <section className="py-5 border-b border-[var(--border)]/60">
        <p className="text-sm text-gray-500">Loading MOM vote…</p>
      </section>
    );

  if (!momMod)
    return (
      <section className="py-5 border-b border-[var(--border)]/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-blue-600/90">
            Man of the Match
          </h2>

          <button
            onClick={() => setOpen(true)}
            className="text-[13px] font-medium text-blue-600/90 hover:opacity-75"
          >
            Vote →
          </button>

        </div>

        <div className="text-[14px] font-medium">
          vs {match.opponent}
        </div>

        <p className="text-xs text-gray-500 mt-1.5">
          {new Date(match.date).toLocaleDateString("en-GB")} •{" "}
          {match.kickoff
            ? new Date(match.kickoff).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Kickoff TBD"}
        </p>
      </section>
    );

  // Actual vote module
  const candidates = momMod?.data?.candidates ?? [];
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const top = sorted[0] ?? null;
  const noCandidates = !top;

  const totalVotes = sorted.reduce((sum, c) => sum + c.votes, 0);
  const pct = totalVotes && top ? Math.round((top.votes / totalVotes) * 100) : 0;

  const getBarColor = () => {
    if (!isStarted) return "bg-gray-300";
    if (isClosed) return "bg-gray-400";
    if (hoursLeft <= 2) return "bg-red-500";
    if (hoursLeft <= 6) return "bg-orange-400";
    return "bg-green-500";
  };

  return (
    <section className="pt-5 pb-6 border-b border-[var(--border)]/60">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-blue-600/90">
          Man of the Match
        </h2>

        <Link
          href={`/teams/${teamId}/mom-vote`}
          className="text-[13px] font-medium text-blue-600/90 hover:opacity-75"
        >
          View →
        </Link>
      </div>

      <div className="text-[14px] font-medium">
        vs {match.opponent}
      </div>

      <p className="text-xs text-gray-500 mt-1.5">
        {new Date(match.date).toLocaleDateString("en-GB")} •{" "}
        {match.kickoff
          ? new Date(match.kickoff).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Kickoff TBD"}
      </p>

      {/* Started */}
      {isStarted && (
        <div className="mt-3">

          {/* TAGS */}
          <div className="flex items-center gap-2 text-xs mb-2">
            <span className="px-2 py-[3px] rounded-md font-medium bg-green-600 text-white">
              {isClosed ? "CLOSED" : "OPEN"}
            </span>

            {!isClosed && (
              <>
                <span className="px-2 py-[3px] bg-gray-100 rounded-md text-gray-700">
                  Closes{" "}
                  {endTime?.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <span className="px-2 py-[3px] rounded-md bg-yellow-100 text-yellow-700">
                  {timeLeft} left
                </span>
              </>
            )}
          </div>

          {top && (
            <div className="flex items-center gap-3 mt-3">
              {top.photoUrl ? (
                <Image
                  src={top.photoUrl}
                  width={42}
                  height={42}
                  className="rounded-full"
                  alt={top.name}
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-300 flex items-center justify-center">
                  {top.name.charAt(0)}
                </div>
              )}

              <div>
                <p className="font-medium">{top.name}</p>
                <p className="text-xs text-gray-600">
                  {isClosed ? `${pct}% • Final` : `${pct}%`}
                </p>
              </div>
            </div>
          )}

          <div className="w-full bg-gray-200 h-[6px] mt-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${getBarColor()}`}
              style={{ width: `${Math.max(progress, 0)}%` }}
            />
          </div>

          {noCandidates && (
            <p className="mt-3 text-sm text-gray-500 italic">
              No players added yet — be the first to vote.
            </p>
          )}

          {open && moduleData && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-full max-w-lg p-4 shadow-xl">
                
                {/* Close Button */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>

                {/* 🔥 오늘 페이지 모듈 그대로 사용 */}
                <MOMVoteModule
                  mod={moduleData}
                  myVote={null}
                  userId={user?.uid ?? ""}        // ⭐ 이제 타입 맞음
                  teamId={teamId}
                  isStarted={!!isStarted}
                  isClosed={!!isClosed}
                  onVote={async (candidateId: string) => {
                    await fetch(`/api/teams/${teamId}/momvote/${moduleData.id}/vote`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ candidateId, userId: user?.uid }),
                    });
                  }}
                  onAddCandidate={async (
                    name: string,
                    position?: string,
                    photoUrl?: string
                  ) => {
                    const res = await fetch(
                      `/api/teams/${teamId}/momvote/${moduleData.id}/addCandidate`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, position, photoUrl }),
                      }
                    );
                    const data = await res.json();

                    setModuleData((old: any) => ({
                      ...old,
                      data: {
                        ...old.data,
                        candidates: [...old.data.candidates, data.candidate],
                      },
                    }));

                    return data.candidate;
                  }}
                />

              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
