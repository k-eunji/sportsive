// src/app/teams/hooks/useTeamRelationship.ts
"use client";

import useSWR from "swr";
import { TeamRelationshipStatus } from "@/lib/teamRelationships";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTeamRelationship(teamId: string) {
  const { data, mutate, isLoading, error } = useSWR<{ status: TeamRelationshipStatus }>(
    `/api/teams/${teamId}/relationship`,
    fetcher
  );

  const setRelationship = async (newStatus: TeamRelationshipStatus) => {
    await fetch(`/api/teams/${teamId}/relationship`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    mutate({ status: newStatus });
  };

  return {
    status: data?.status ?? "NONE",
    isLoading,
    isError: !!error,
    setRelationship,
  };
}
