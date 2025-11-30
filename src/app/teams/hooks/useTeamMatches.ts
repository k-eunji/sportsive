//src/app/teams/hooksuseTeamMatches.ts

import useSWR from "swr";
import type { MatchEvent } from "@/types";

export function useTeamMatches(teamId?: string) {
  const fetcher = (url: string) => fetch(url).then(res => res.json());

  const { data, error } = useSWR<{ matches: MatchEvent[] }>(
    teamId ? `/api/teams/${teamId}/matches` : null,
    fetcher
  );

  return {
    matches: data?.matches ?? [],
    loading: !error && !data,
    error,
  };
}
