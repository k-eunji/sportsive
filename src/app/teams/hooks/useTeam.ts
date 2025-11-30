// src/app/teams/hooks/useTeam.ts

"use client";

import useSWR from "swr";

export interface TeamDetail {
  id: string;
  name: string;
  logo?: string;
  region?: string;
  city?: string;
  homepageUrl?: string;
  transportInfo?: string;
  venue?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTeam(teamId?: string) {
  const { data, error } = useSWR<{ team: TeamDetail | null }>(
    teamId ? `/api/teams/${teamId}` : null,
    fetcher
  );

  return {
    team: data?.team ?? null,
    isLoading: !error && !data,
    isError: error,
  };
}
