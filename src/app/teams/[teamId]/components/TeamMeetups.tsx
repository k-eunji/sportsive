// src/app/teams/[teamId]/components/TeamMeetups.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import TeamMeetupCard from "./TeamMeetupCard";
import type { MeetupWithEvent } from "@/types/event";

interface TeamMeetupsProps {
  teamId: string;
}

export default function TeamMeetups({ teamId }: TeamMeetupsProps) {
  const [matchMeetups, setMatchMeetups] = useState<MeetupWithEvent[]>([]);
  const [fanMeetups, setFanMeetups] = useState<MeetupWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [filter, setFilter] = useState<"all" | "match" | "fan">("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/teams/${teamId}/meetups`, {
          cache: "no-store"
        });
        const data = await res.json();

        setMatchMeetups(data.matchMeetups ?? []);
        setFanMeetups(data.fanMeetups ?? []);
      } catch (err) {
        console.error("❌ TeamMeetups fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [teamId]);

  const allMeetups = [...matchMeetups, ...fanMeetups];

  const filtered = useMemo(() => {
    if (filter === "match") return matchMeetups;
    if (filter === "fan") return fanMeetups;
    return allMeetups;
  }, [filter, matchMeetups, fanMeetups]);

  if (loading)
    return <p className="text-center mt-12 text-gray-500">Loading meetups...</p>;

  if (error)
    return <p className="text-center mt-12 text-red-500">Failed to load meetups.</p>;

  return (
    <div className="space-y-8">

      {/* ⭐ Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "match", label: "Match" },
          { key: "fan", label: "Fan" },
        ].map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium border transition
                ${isActive
                  ? "text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                }
              `}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(90deg, var(--primary-from), var(--primary-to))",
                      borderColor: "transparent",
                    }
                  : {}
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ⭐ Section Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Meetups
      </h3>

      {/* ⭐ Empty */}
      {!loading && filtered.length === 0 && (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          No meetups yet.
        </div>
      )}

      {/* ⭐ Meetup Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((meetup) => (
          <TeamMeetupCard key={meetup.id} meetup={meetup} />
        ))}
      </div>
    </div>
  );
}
