//src/app/explore/components/ExploreSearchResults/index.tsx

"use client";

import { useEffect, useState } from "react";

import SearchSectionTeams from "./SearchSectionTeams";
import SearchSectionEvents from "./SearchSectionEvents";
import SearchSectionFanHub from "./SearchSectionFanHub";
import SearchSectionLive from "./SearchSectionLive";
import SearchSectionMeetups from "./SearchSectionMeetups";

// ----- Types -----
export type SearchTeam = {
  id: string | number;
  name: string;
  city?: string;
  region?: string;
};

export type SearchEvent = {
  id: string | number;
  homeTeam: string;
  awayTeam: string;
  competition?: string;
  date?: string;
};

export type SearchPost = {
  id: string | number;
  text: string;
  authorNickname: string;
};

export type SearchLiveRoom = {
  id: string | number;
  title: string;
  participants: number;
};

export type SearchMeetup = {
  id: string | number;
  title: string;
  city?: string;
  date?: string;
};

export default function ExploreSearchResults({ query }: { query: string }) {
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState<{
    teams: SearchTeam[];
    events: SearchEvent[];
    posts: SearchPost[];
    live: SearchLiveRoom[];
    meetups: SearchMeetup[];
  }>({
    teams: [],
    events: [],
    posts: [],
    live: [],
    meetups: [],
  });

  // ---------- FETCH FROM SINGLE SEARCH API ----------
  useEffect(() => {
    if (query.length < 2) return;

    async function load() {
      setLoading(true);

      try {
        const res = await fetch(`/api/search/all?query=${query}`);
        const data = await res.json();

        setResults({
          teams: data.teams ?? [],
          events: data.events ?? [],
          posts: data.posts ?? [],
          live: data.live ?? [],
          meetups: data.meetups ?? [],
        });
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [query]);

  if (!query || query.length < 2) return null;

  if (loading)
    return <p className="text-gray-500 mt-4 animate-pulse">Searching…</p>;

  const { teams, events, posts, live, meetups } = results;

  const isEmpty =
    teams.length === 0 &&
    events.length === 0 &&
    posts.length === 0 &&
    live.length === 0 &&
    meetups.length === 0;

  return (
    <section className="mt-6 space-y-10">
      <SearchSectionTeams teams={teams} />
      <SearchSectionEvents events={events} />
      <SearchSectionFanHub posts={posts} />
      <SearchSectionLive rooms={live} />
      <SearchSectionMeetups meetups={meetups} />

      {isEmpty && (
        <p className="text-gray-500 text-sm">
          No results found for “{query}”.
        </p>
      )}
    </section>
  );
}
