// src/app/teams/[teamId]/TeamPage.client.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RivalSummaryCard from "./components/RivalSummaryCard";
import MomVoteSummaryCard from "./components/MomVoteSummaryCard";
import { useUser } from "@/context/UserContext";

interface TeamPageClientProps {
  teamId: string;
  todayMatch: any | null;
  nextMatch: any | null;
}

export default function TeamPageClient({
  teamId,
  todayMatch,
  nextMatch,
}: TeamPageClientProps) {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useUser();

  const [rivalTopTeam, setRivalTopTeam] = useState<any | null>(null);
  const [totalVotes, setTotalVotes] = useState<number | null>(null);
  const [rivalMod, setRivalMod] = useState<any | null>(null);
  const [rivalVoted, setRivalVoted] = useState<boolean>(false);
  const [momMod, setMomMod] = useState<any | null>(null);

  useEffect(() => {
    const check = async () => {
      if (!user?.uid) return;

      const res = await fetch(`/api/teams/${teamId}/rivalvote/myVote`, {
        headers: { "x-user": user.uid },
      });
      const data = await res.json();
      setRivalVoted(Boolean(data.myVote));
    };
    check();
  }, [teamId, user?.uid]);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`/api/teams/${teamId}/rivalvote/summary`, {
          cache: "no-store",
        });
        const json = await res.json();
        setRivalTopTeam(json.rivalTopTeam ?? null);
        setTotalVotes(json.totalVotes ?? 0);
      } catch (_) {}
    }
    fetchSummary();
  }, [teamId]);

  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      let res = await fetch(`/api/teams/${teamId}/rivalvote`, {
        cache: "no-store",
      });
      let modData = await res.json();

      if (!modData?.data?.options?.length) {
        await fetch(`/api/teams/${teamId}/rivalvote/create`, {
          method: "POST",
        });

        res = await fetch(`/api/teams/${teamId}/rivalvote`, {
          cache: "no-store",
        });
        modData = await res.json();
      }

      setRivalMod({
        id: "module",
        type: "rivalvote",
        data: modData.data,
      });

      const voteRes = await fetch(`/api/teams/${teamId}/rivalvote/myVote`, {
        headers: { "x-user": user.uid },
      });
      const { myVote } = await voteRes.json();
      setRivalVoted(Boolean(myVote));
    })();
  }, [teamId, user?.uid]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/teams/${teamId}/momvote/module`, {
        cache: "no-store",
      });
      const { module } = await res.json();
      setMomMod(module);
    })();
  }, [teamId]);

  useEffect(() => {
    if (params?.get("refresh") === "rival") router.refresh();
  }, [params, router]);

  const handleRivalVote = async (rivalTeamId: string) => {
    if (!user?.uid) return;

    await fetch(`/api/teams/${teamId}/rivalvote/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": user.uid,
      },
      body: JSON.stringify({
        userId: user.uid,
        rivalTeamId,
      }),
    });

    window.location.href = `/teams/${teamId}?refresh=rival`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-[12px] space-y-4">
      <RivalSummaryCard
        teamId={teamId}
        rivalTopTeam={rivalTopTeam}
        totalVotes={totalVotes ?? undefined}
        mod={rivalMod}
        onVote={handleRivalVote}
        user={user}       // ONLY ONE 사용!
      />

      <MomVoteSummaryCard
        teamId={teamId}
        todayMatch={todayMatch}
        nextMatch={nextMatch}
        momMod={momMod}
        user={user}   // ⭐ 추가
      />

    </div>
  );
}
