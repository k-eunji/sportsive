//src/hooks/useTeamMatchesAll.ts

import useSWR from "swr";
import type { MatchEvent } from "@/types";

export function useTeamMatchesAll(teamId?: string) {
  const fetcher = (url: string) => fetch(url).then(res => res.json());

  const { data, error } = useSWR<{ matches: MatchEvent[] }>(
    teamId ? `/api/teams/${teamId}/matches/all` : null, // ★ 반드시 이것
    fetcher
  );

  return {
    matches: data?.matches ?? [],
    loading: !error && !data,
    error,
  };
}
