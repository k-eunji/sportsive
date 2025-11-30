// src/app/teams/hooks/useFanRelationships.ts
"use client";

import { RelationshipStatus } from "@/lib/relationships";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useFanRelationships(teamId: string) {
  const { data, mutate, isLoading, error } = useSWR<
    { userId: string; name: string; status: RelationshipStatus }[]
  >(`/api/teams/${teamId}/fans`, fetcher);

  const updateRelationship = async (userId: string, newStatus: RelationshipStatus) => {
    await fetch(`/api/relationships/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    mutate();
  };

  return {
    fans: data ?? [],
    isLoading,
    isError: !!error,
    updateRelationship,
  };
}
