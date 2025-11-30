// src/app/teams/[teamId]/components/RivalSummaryCard.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import RivalVoteModal from "../rival-vote/components/RivalVoteModal";

export default function RivalSummaryCard({
  teamId,
  rivalTopTeam,
  totalVotes,
  mod: initialMod,
  onVote,
  user,
}: any) {
  const [open, setOpen] = useState(false);
  const [mod, setMod] = useState<any>(initialMod);
  const [voted, setVoted] = useState(false);

  const loadModule = async () => {
    const res = await fetch(`/api/teams/${teamId}/rivalvote`, {
      cache: "no-store",
    });

    let data = await res.json();

    // case1: { module: {...} }
    if (data.module) data = data.module;

    // case2: { data: { module: {...} } }
    if (data.data?.module) data = data.data.module;

    // case3: { options: [...] }
    if (data.options && !data.data) {
      data = { data: { options: data.options } };
    }

    // case4: no data
    if (!data.data) data.data = {};

    // case5: no options
    if (!data.data.options) data.data.options = [];

    setMod(data);
  };

  const loadMyVote = async () => {
    if (!user?.uid) return;

    const res = await fetch(`/api/teams/${teamId}/rivalvote/myVote`, {
      headers: { "x-user": user.uid },
    });
    const data = await res.json();
    setVoted(Boolean(data.myVote));
  };

  const openModal = async () => {
    if (!user?.uid) return;

    const res = await fetch(`/api/teams/${teamId}/rivalvote/myVote`, {
      headers: { "x-user": user.uid },
    });
    const data = await res.json();
    const hasVoted = Boolean(data.myVote);

    if (hasVoted) {
      alert("You can vote again tomorrow.");
      return;
    }

    await loadModule();
    setOpen(true);
  };

  const handleVote = async (rivalTeamId: string) => {
    await onVote(rivalTeamId);
    await loadModule();
    await loadMyVote();
  };

  const top3 = useMemo(() => {
    if (!mod?.data?.options) return [];

    const sorted = [...mod.data.options].sort(
      (a, b) => (b.votes || 0) - (a.votes || 0)
    );

    let rank = 1;
    const ranked = sorted.map((team, idx) => {
      if (idx > 0 && team.votes < sorted[idx - 1].votes) {
        rank = idx + 1;
      }
      return { ...team, rank };
    });

    return ranked.filter((t) => t.votes > 0).slice(0, 3);
  }, [mod]);

  useEffect(() => {
    setMod(initialMod);
  }, [initialMod]);

  useEffect(() => {
    if (!user?.uid) return;

    const check = async () => {
      const res = await fetch(`/api/teams/${teamId}/rivalvote/myVote`, {
        headers: { "x-user": user.uid },
      });
      const data = await res.json();
      setVoted(Boolean(data.myVote));
    };
    check();
  }, [teamId, user?.uid]);

  return (
    <section className="pt-5 pb-6 border-b border-[var(--border)]/60">
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

      {top3.length === 0 && (
        <p className="text-[14px] text-gray-500">No rival vote data yet.</p>
      )}

      {top3.length > 0 && (
        <div className="flex flex-col gap-4">
          {top3.map((team) => {
            const total = totalVotes || 0;
            const percent =
              total > 0 ? Math.round((team.votes / total) * 100) : 0;

            return (
              <div key={team.teamId} className="flex items-center gap-4 py-1">
                <div className="relative">
                  <img
                    src={team.logo}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <span
                    className={`absolute -top-2 -right-2 text-white text-[10px] px-2 py-1 rounded-full shadow font-bold tracking-wide ${
                      team.rank === 1 ? "bg-red-700" : "bg-gray-600"
                    }`}
                  >
                    {team.rank}
                  </span>
                </div>

                <div className="flex flex-col">
                  <p className="text-[14px] font-medium">{team.teamName}</p>
                  <p className="text-xs text-gray-500">
                    {team.votes} votes • {percent}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalVotes !== undefined && (
        <p className="mt-3 text-[11px] text-gray-500">
          Total votes: {totalVotes}
        </p>
      )}

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
