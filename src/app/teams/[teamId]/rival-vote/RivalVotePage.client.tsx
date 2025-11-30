//src/app/teams/[teamId]/rival-vote/RivalVotePage.client.tsx

"use client";

import { useEffect, useState } from "react";
import RivalVoteModule from "./components/RivalVoteModule";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function RivalVotePageClient({ teamId }: { teamId: string }) {

  const [mod, setMod] = useState<any>(null);
  const [voted, setVoted] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user?.uid) return;   // 🔥 user 준비될 때까지 기다림

    (async () => {
      let res = await fetch(`/api/teams/${teamId}/rivalvote`);
      let modData = await res.json();

      if (!modData || !modData.data?.options?.length) {
        await fetch(`/api/teams/${teamId}/rivalvote/create`, { method: "POST" });

        res = await fetch(`/api/teams/${teamId}/rivalvote`);
        modData = await res.json();
      }

      setMod({
        id: "module",
        type: "rivalvote",
        data: modData.data,
      });

      const voteRes = await fetch(`/api/teams/${teamId}/rivalvote/myVote`, {
        headers: { "x-user": user.uid },
      });
      const { myVote } = await voteRes.json();
      setVoted(Boolean(myVote));   // 🎯 이제 true로 정상 반영됨
    })();
  }, [teamId, user?.uid]);   // 🔥 user도 dependency에 포함

  const handleVote = async (rivalTeamId: string) => {
    await fetch(`/api/teams/${teamId}/rivalvote/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": user?.uid ?? "",
      },
      body: JSON.stringify({
        userId: user?.uid,
        rivalTeamId,
      }),
    });

    // 최신 데이터 갱신
    const res = await fetch(`/api/teams/${teamId}/rivalvote`);
    const updated = await res.json();
    setMod({
      id: "module",
      type: "rivalvote",
      data: updated.data,
    });

    // myVote 다시 체크
    const voteRes = await fetch(`/api/teams/${teamId}/rivalvote/myVote`, {
      headers: { "x-user": user?.uid ?? "" }
    });
    const { myVote } = await voteRes.json();

    setVoted(Boolean(myVote));

    // ⭐⭐⭐ 이거 반드시 추가 ⭐⭐⭐
    router.push(`/teams/${teamId}?refresh=rival`);
  };

  if (!mod)
    return <p className="p-10 text-center text-gray-500">
      No Rival Vote module found.
    </p>;

  return (
    <div className="max-w-xl mx-auto p-4 pt-24">
      <h1 className="text-2xl font-bold mb-4">Rival Vote</h1>

      <RivalVoteModule mod={mod} voted={voted} onVote={handleVote} />
    </div>
  );
}
