// src/app/teams/hooks/useTeams.ts

"use client";

import useSWR from "swr";

export interface Team {
  id: string;
  name: string;
  logo?: string;
  region?: string;
  city?: string;
  sport?: string;          // ✅ 추가
  competition?: string;    // ✅ 추가
  homepageUrl?: string;
  venue?: string;
  transportInfo?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
};

export function useTeams() {
  const { data, error } = useSWR<{ teams: Team[] }>("/api/teams", fetcher);

  return {
    teams: data?.teams ?? [],
    isLoading: !error && !data,
    isError: error,
  };
}
