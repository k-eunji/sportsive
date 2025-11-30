// src/app/teams/[teamId]/mom-vote/MomVotePage.client.tsx

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

import TodayMatchCard from "./components/TodayMatchCard";
import MOMVoteModule from "./components/MOMVoteModule";
import useMomvoteCron from "@/hooks/useMomvoteCron";
import type { MomVoteModuleType } from "@/types/momVote";

export default function MomVotePageClient({ teamId }: { teamId: string }) {
  const { user } = useUser();

  const [todayMatch, setTodayMatch] = useState<any>(null);
  const [nextMatch, setNextMatch] = useState<any>(null);

  const [momMod, setMomMod] = useState<MomVoteModuleType | null | undefined>(undefined);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // 1) 경기 정보 불러오기
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/teams/${teamId}/matches/summary`, {
        cache: "no-store",
      });
      const data = await res.json();
      setTodayMatch(data.todayMatch);
      setNextMatch(data.nextMatch);
    })();
  }, [teamId]);

  // 2) MOM Module 가져오기
  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/teams/${teamId}/momvote/module`,
        { cache: "no-store" }
      );

      const { module } = await res.json();
      setMomMod(module); // 오늘 경기 기반 모듈
    })();
  }, [teamId]);

  // 3) 내 투표 가져오기
  useEffect(() => {
    if (!user || !momMod) return; // 둘 다 준비되기 전에는 실행 X

    (async () => {
      const res = await fetch(
        `/api/teams/${teamId}/momvote/${momMod.id}/myVote`,
        {
          cache: "no-store",
          headers: { "x-user": user.uid },
        }
      );
      const data = await res.json();
      setMyVote(data.myVote);
    })();
  }, [teamId, momMod?.id, user?.uid]);

  // 히스토리 가져오기
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/teams/${teamId}/momvote/list`, {
        cache: "no-store",
      });

      const json = await res.json();
      setHistory(json.list ?? []);
    })();
  }, [teamId]);

  if (!user) return <p className="p-10 text-center">Login required</p>;
  // 2) 로딩 상태
  if (momMod === undefined)
    return <p className="p-10 text-center">Mom module Loading...</p>;

  // 3) 모듈 없음(null)
  // 3) 모듈 없음(null)
  const NotOpenView = momMod === null ? (
    (() => {
      const match = todayMatch ?? nextMatch;

      if (!match) {
        return (
          <div className="p-10 text-center space-y-4">
            <p className="text-lg font-semibold">No match found.</p>
          </div>
        );
      }

      const kickoff = match.kickoff
        ? new Date(match.kickoff)
        : new Date(match.date);

      const dateStr = kickoff.toLocaleDateString("en-GB");
      const timeStr = kickoff.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <div className="space-y-1">
          <p className="text-base font-semibold">MOM vote is not open yet.</p>
          <p className="text-sm text-gray-500">
            Voting will open at{" "}
            <span className="font-bold text-gray-800">
              {dateStr} {timeStr}
            </span>
          </p>
        </div>
      );

    })()
  ) : null;

  return (
    <div className="max-w-2xl mx-auto p-4 pt-24 space-y-6">
      <h1 className="text-2xl font-bold">Man of the Match</h1>

      {/* 🔥 투표 오픈 안 됐을 때 안내문 */}
      {NotOpenView}

      {/* 🔥 투표 모듈 (오늘 경기 모듈 있을 경우에만) */}
      {momMod && (
        <TodayMatchCard
          todayMatch={todayMatch}
          nextMatch={nextMatch}
          momMod={momMod}
        >
          <MOMVoteModule
            mod={momMod}
            myVote={myVote}
            userId={user.uid}
            teamId={teamId}
            isStarted={true}
            isClosed={momMod.data.locked}
            onVote={async (candidateId) => {
              const res = await fetch(
                `/api/teams/${teamId}/momvote/${momMod.id}/vote`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ candidateId, userId: user.uid }),
                }
              );
              const data = await res.json();
              if (data.success) setMyVote(candidateId);
              else alert(data.error ?? "Vote failed");
            }}
            onAddCandidate={async (name, position, photoUrl) => {
              const res = await fetch(
                `/api/teams/${teamId}/momvote/${momMod.id}/addCandidate`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, position, photoUrl }),
                }
              );
              const data = await res.json();
              const newCandidate = {
                id: data.candidate.id,
                name: data.candidate.name,
                position: data.candidate.position,
                photoUrl: data.candidate.photoUrl,
                votes: data.candidate.votes,
              };
              setMomMod((prev) => ({
                ...prev!,
                data: {
                  ...prev!.data,
                  candidates: [...prev!.data.candidates, newCandidate],
                },
              }));
              return newCandidate;
            }}
          />
        </TodayMatchCard>
      )}

      {/* 🔥 항상 떠야 하는 히스토리 */}
      <section className="border-t pt-6 space-y-4">
        <h2 className="text-xl font-semibold">Previous MOM Results</h2>

        {history.length === 0 && (
          <p className="text-gray-500 text-sm">No MOM history.</p>
        )}

        <div className="space-y-4">
          {history.map((mod) => {
            if (!mod?.data) return null;

            const sorted = [...mod.data.candidates].sort((a, b) => b.votes - a.votes);
            const winner = sorted[0];

            return (
              <div key={mod.id} className="p-4 border rounded-xl bg-white shadow-sm">
                <div className="text-base font-semibold">vs {mod.data.opponent}</div>
                <div className="text-xs text-gray-500">
                  {new Date(mod.data.kickoff).toLocaleDateString("en-GB")}
                </div>

                {winner ? (
                  <div className="mt-2 text-sm">
                    🏆 Winner: <span className="font-bold">{winner.name}</span> —{" "}
                    {winner.votes} votes
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500 italic">No candidates</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
