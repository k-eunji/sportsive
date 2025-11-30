//src/app/teams/[teamId]/hooks/useQnAList.ts

"use client";

import { useState, useEffect } from "react";

export function useQnAList(teamId: string, sort: string) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch(`/api/teams/${teamId}/qna/list?sort=${sort}`, {
      cache: "no-store",
    });

    setQuestions(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [sort]);

  return { questions, loading, load };
}
