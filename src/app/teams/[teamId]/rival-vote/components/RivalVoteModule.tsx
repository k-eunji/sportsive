// src/app/teams/[teamId]/rival-vote/components/RivalVoteModule.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { RivalVoteModuleType } from "@/types";
import RivalVoteModal from "../components/RivalVoteModal";

export default function RivalSummaryCard({
  teamId,
  rivalTopTeam,
  totalVotes,
  mod: initialMod,
  voted: initialVoted,
  onVote,
}: any) {
  const [open, setOpen] = useState(false);
  const [mod, setMod] = useState<any>(initialMod);
  const [voted, setVoted] = useState(initialVoted);

  // 🔥 Rival Vote Module 불러오기
  const loadModule = async () => {
    const res = await fetch(`/api/teams/${teamId}/rivalvote`, {
      cache: "no-store",
    });
    const data = await res.json();
    setMod(data);
  };

  // 🔥 내 투표 여부 체크
  const loadMyVote = async () => {
    const res = await fetch(`/api/teams/${teamId}/rivalvote/myVote`, {
      headers: { "x-user": window.localStorage.getItem("uid") ?? "" },
    });
    const data = await res.json();
    setVoted(Boolean(data.myVote));
  };

  const openModal = async () => {
    await loadModule();
    await loadMyVote();
    setOpen(true);
  };

  // 🔥 투표 처리
  const handleVote = async (rivalTeamId: string) => {
    await onVote(rivalTeamId);
    await loadModule();
    await loadMyVote();
  };

  /** ▼▼▼ 🔥🔥 여기서부터 Top3 처리 추가 🔥🔥 ▼▼▼ */

  const top3 = useMemo(() => {
    if (!mod?.data?.options) return [];

    // 득표순 정렬
    const sorted = [...mod.data.options].sort(
      (a, b) => (b.votes || 0) - (a.votes || 0)
    );

    // 공동 순위 포함
    let rank = 1;
    const ranked = sorted.map((t, i) => {
      if (i > 0 && t.votes < sorted[i - 1].votes) {
        rank = i + 1;
      }
      return { ...t, rank };
    });

    return ranked.filter((t) => t.votes > 0).slice(0, 3);
  }, [mod]);

  /** ▲▲▲ 🔥🔥 Top3 처리 끝 🔥🔥 ▲▲▲ */

  return (
    <section className="pt-5 pb-6 border-b border-[var(--border)]/60">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-red-600/90">
          Rival Vote
        </h2>

        <button
          onClick={openModal}
          className="text-[13px] font-medium text-red-600/90 hover:opacity-75 transition"
        >
          Vote →
        </button>
      </div>

      {/* NO DATA */}
      {(!top3 || top3.length === 0) && (
        <p className="text-[14px] text-gray-500">No rival vote data yet.</p>
      )}

      {/* 🔥 Top 3 리스트 */}
      {top3 && top3.length > 0 && (
        <div className="flex flex-col gap-3">
          {top3.map((team) => (
            <div key={team.teamId} className="flex items-center gap-3 py-1">
              <img
                src={team.logo}
                className="w-10 h-10 rounded-full object-cover border"
              />

              <div className="flex flex-col">
                <p className="text-[14px] font-medium">{team.teamName}</p>
                <p className="text-xs text-gray-500">
                  {team.votes} votes (Rank {team.rank})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Votes */}
      {totalVotes !== undefined && (
        <p className="mt-3 text-[11px] text-gray-500">Total votes: {totalVotes}</p>
      )}

      {/* 모달 */}
      {open && mod && (
        <RivalVoteModal
          mod={{ data: { options: mod.data?.options ?? [] } }}
          voted={voted}
          onVote={async (teamId) => {
            await handleVote(teamId);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}
